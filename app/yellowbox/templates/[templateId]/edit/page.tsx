"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Save,
  Sparkles,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";
import { TemplateCanvas } from "@/components/yellowbox/TemplateCanvas";
import { TldrawSnapshot } from '@/lib/yellowbox/types/template';

interface Template {
  id: string;
  name: string;
  description: string;
  snapshot: TldrawSnapshot;
}

export default function EditTemplatePage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasSnapshot, setCanvasSnapshot] = useState<TldrawSnapshot | null>(null);
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('yellowbox_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTemplate(data);
        setTemplateName(data.name);
        setTemplateDescription(data.description || '');
        setCanvasSnapshot(data.snapshot);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('加载模板失败');
      router.push('/yellowbox/templates');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = useCallback(async () => {
    if (!templateName.trim()) {
      toast.error('请输入模板名称');
      return;
    }

    if (!canvasSnapshot) {
      toast.error('画布内容为空');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('yellowbox_templates')
        .update({
          name: templateName,
          description: templateDescription || '自定义模板',
          snapshot: canvasSnapshot,
        })
        .eq('id', templateId);

      if (error) {
        throw error;
      }

      toast.success(`模板 "${templateName}" 更新成功！`);
      router.push('/yellowbox/templates');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error(
        `更新模板失败：${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsSaving(false);
    }
  }, [templateName, templateDescription, canvasSnapshot, templateId, router]);

  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSaveClick = useCallback(() => {
    if (!canvasSnapshot) {
      toast.error('画布内容为空');
      return;
    }
    setShowSaveDialog(true);
  }, [canvasSnapshot]);

  const handleSnapshotChange = useCallback((snapshot: TldrawSnapshot) => {
    setCanvasSnapshot(snapshot);
  }, []);

  const handleBack = useCallback(() => {
    router.push('/yellowbox/templates');
  }, [router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-yellow-600">正在加载模板...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-yellow-600 mb-4">模板未找到</p>
          <Link href="/yellowbox/templates">
            <Button>返回模板中心</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 全屏模板画布 */}
      <div className="fixed inset-0">
        <TemplateCanvas 
          initialSnapshot={template.snapshot}
          onSnapshotChange={handleSnapshotChange}
          onSave={handleSaveClick}
          onBack={handleBack}
          showSaveButton={true}
          isSaving={isSaving}
          templateName={template.name}
        />
      </div>

      {/* 保存更改对话框 */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              保存更改
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">模板名称 *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="例如：我的日记模板"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">模板描述</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="简单描述这个模板的用途..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                💡 修改的文本将在应用模板时被 AI 替换为个性化内容
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={isSaving}
              className="flex-1"
            >
              取消
            </Button>
            <Button 
              onClick={saveTemplate}
              disabled={isSaving || !templateName.trim()}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存更改
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}