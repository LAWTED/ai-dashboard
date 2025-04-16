'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getPromptByName, updatePrompt, Prompt } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AlicePromptPage() {
  const [prompt, setPrompt] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [promptData, setPromptData] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchPrompt() {
      setIsLoading(true);
      const data = await getPromptByName('alice');
      if (data) {
        setPromptData(data);
        setPrompt(data.content);
        console.log('Loaded prompt data:', data);
      } else {
        toast.error('Failed to fetch prompt data');
      }
      setIsLoading(false);
    }

    fetchPrompt();
  }, []);

  const handleToggleEdit = () => {
    if (isEditable) {
      setIsEditable(false);
      if (promptData) {
        setPrompt(promptData.content); // Reset to current saved value
      }
      toast.info('Changes cancelled');
    } else {
      setIsEditable(true);
      toast.info('You can now edit the prompt');
    }
  };

  const handleSavePrompt = async () => {
    if (!promptData) return;

    try {
      setIsSaving(true);

      // Show loading toast
      const toastId = toast.loading('Saving prompt...');

      console.log('Saving prompt with ID:', promptData.id);
      const success = await updatePrompt(promptData.id, prompt);

      if (success) {
        console.log('Successfully saved prompt');
        setPromptData({
          ...promptData,
          content: prompt,
          updated_at: new Date().toISOString()
        });
        setIsEditable(false);
        toast.success('Prompt successfully saved to database', { id: toastId });
      } else {
        console.error('Failed to save prompt - API returned false');
        toast.error('Save failed, please try again', { id: toastId });
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Error during save: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Alice System Prompt</h1>
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
                onClick={handleSavePrompt}
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
              value={prompt}
              onChange={(e) => isEditable && setPrompt(e.target.value)}
              className="h-[70vh] font-mono text-sm"
              readOnly={!isEditable}
            />

            <div className="text-sm text-gray-500 mt-2">
              <p>Last updated: {promptData ? new Date(promptData.updated_at).toLocaleString('en-US') : 'N/A'}</p>
              {promptData && <p>Database ID: {promptData.id}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}