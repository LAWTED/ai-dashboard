'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getFileByName, updateFile, File } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AliceFilePage() {
  const [file, setFile] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [fileData, setFileData] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchFile() {
      setIsLoading(true);
      try {
        const data = await getFileByName('alice');

        if (data) {
          setFileData(data);
          setFile(data.content);
          console.log('Loaded file data:', data);
        } else {
          toast.error('Failed to fetch file data');
        }
      } catch (error) {
        toast.error('Error loading file');
        console.error('Error fetching file:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFile();
  }, []);

  const handleToggleEdit = () => {
    if (isEditable) {
      setIsEditable(false);
      if (fileData) {
        setFile(fileData.content); // Reset to current saved value
      }
      toast.info('Changes cancelled');
    } else {
      setIsEditable(true);
      toast.info('You can now edit the file');
    }
  };

  const handleSaveFile = async () => {
    if (!fileData) return;

    try {
      setIsSaving(true);

      // Show loading toast
      const toastId = toast.loading('Saving file...');

      console.log('Saving file with ID:', fileData.id);

      const success = await updateFile(fileData.id, file);

      if (success) {
        console.log('Successfully saved file');
        // Refresh file data
        const updatedData = await getFileByName('alice');
        if (updatedData) {
          setFileData(updatedData);
        }
        setIsEditable(false);
        toast.success('File successfully saved to database', { id: toastId });
      } else {
        console.error('Failed to save file');
        toast.error('Save failed', { id: toastId });
      }
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Error during save: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Alice File Editor</h1>
          <div className="space-x-2">
            <Button
              onClick={handleToggleEdit}
              variant={isEditable ? "destructive" : "outline"}
              disabled={isSaving}
            >
              {isEditable ? "Cancel" : "Edit"}
            </Button>
            {isEditable && (
              <Button
                onClick={handleSaveFile}
                variant="default"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save to Database"}
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={file}
              onChange={(e) => isEditable && setFile(e.target.value)}
              className="h-[70vh] font-mono text-sm"
              readOnly={!isEditable}
            />

            <div className="text-sm text-gray-500 mt-2">
              <p>Last updated: {fileData ? new Date(fileData.updated_at).toLocaleString('en-US') : 'N/A'}</p>
              {fileData && (
                <>
                  <p>Database ID: {fileData.id}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}