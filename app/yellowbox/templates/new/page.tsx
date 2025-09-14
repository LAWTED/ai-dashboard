"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Save,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TemplateCanvas } from "@/components/yellowbox/TemplateCanvas";
import { TldrawSnapshot } from '@/lib/yellowbox/types/template';

export default function NewTemplatePage() {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [canvasSnapshot, setCanvasSnapshot] = useState<TldrawSnapshot | null>(null);
  const [replaceableShapes, setReplaceableShapes] = useState<string[]>([]);
  const router = useRouter();

  const handleSaveClick = useCallback(() => {
    if (!canvasSnapshot) {
      toast.error('请先在画布中创建一些内容');
      return;
    }
    setShowSaveDialog(true);
  }, [canvasSnapshot]);

  const saveTemplate = useCallback(async () => {
    if (!templateName.trim()) {
      toast.error('请输入模板名称');
      return;
    }

    if (!canvasSnapshot) {
      toast.error('请先在画布中创建一些内容');
      return;
    }

    setIsSaving(true);

    try {
      // 基本验证
      if (!templateName.trim()) {
        toast.error('请输入模板名称');
        return;
      }
      
      if (templateName.length > 100) {
        toast.error('模板名称太长（最多100个字符）');
        return;
      }
      
      if (templateDescription && templateDescription.length > 500) {
        toast.error('模板描述太长（最多500个字符）');
        return;
      }

      // 使用 API 创建模板
      const response = await fetch('/api/yellowbox/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          snapshot: canvasSnapshot,
          replaceableShapes,
          isPublic: false,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '创建模板失败');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '创建模板失败');
      }

      toast.success(`模板 "${templateName}" 创建成功！`);
      setShowSaveDialog(false);
      router.push('/yellowbox/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(
        `创建模板失败：${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsSaving(false);
    }
  }, [templateName, templateDescription, canvasSnapshot, replaceableShapes, router]);

  const handleSnapshotChange = useCallback((snapshot: TldrawSnapshot, shapes?: string[]) => {
    setCanvasSnapshot(snapshot);
    if (shapes) {
      setReplaceableShapes(shapes);
    }
  }, []);

  const handleBack = useCallback(() => {
    router.push('/yellowbox/templates');
  }, [router]);

  return (
    <>
      {/* 全屏模板画布 */}
      <div className="fixed inset-0">
        <TemplateCanvas 
          onSnapshotChange={handleSnapshotChange}
          onSave={handleSaveClick}
          onBack={handleBack}
          showSaveButton={true}
          isSaving={isSaving}
          templateName="新模板"
        />
      </div>

      {/* 保存对话框 */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              保存模板
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">模板名称 *</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="给你的模板起个名字..."
                className="mt-1"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <Label htmlFor="template-description">模板描述</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="描述一下这个模板的用途和特点..."
                className="mt-1"
                rows={3}
                disabled={isSaving}
              />
            </div>

            {replaceableShapes.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ 已标记 {replaceableShapes.length} 个可替换文本区域
                </p>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowSaveDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={isSaving}
              >
                取消
              </Button>
              <Button
                onClick={saveTemplate}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存模板
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}