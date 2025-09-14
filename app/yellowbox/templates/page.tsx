"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Image, 
  Type,
  Sparkles,
  Star,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TemplateListItem } from '@/lib/yellowbox/types/template';
import { initBuiltinTemplates } from '@/lib/yellowbox/builtin-templates';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializingTemplates, setIsInitializingTemplates] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/yellowbox/templates');
      if (!response.ok) {
        throw new Error('加载模板失败');
      }
      
      const data = await response.json();
      setTemplates(data.templates || []);
      
      // 如果没有模板，提示初始化内置模板
      if ((data.templates || []).length === 0) {
        setError('暂无模板，您可以创建内置模板开始使用');
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      const errorMessage = err instanceof Error ? err.message : '加载模板失败';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeBuiltinTemplates = async () => {
    try {
      setIsInitializingTemplates(true);
      const templateIds = await initBuiltinTemplates();
      
      if (templateIds.length > 0) {
        toast.success(`成功创建 ${templateIds.length} 个内置模板`);
        loadTemplates(); // 重新加载列表
      } else {
        toast.error('创建内置模板失败');
      }
    } catch (error) {
      console.error('Error initializing templates:', error);
      toast.error('创建内置模板时发生错误');
    } finally {
      setIsInitializingTemplates(false);
    }
  };

  const deleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`确定要删除模板「${templateName}」吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/yellowbox/templates/${templateId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除操作失败');
      }
      
      toast.success('模板已删除');
      loadTemplates(); // 重新加载列表
    } catch (error) {
      console.error('Error deleting template:', error);
      const errorMessage = error instanceof Error ? error.message : '删除模板失败';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 hover:bg-yellow-100"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                  </div>
                  模板中心
                </h1>
                <p className="text-gray-600 mt-1">创建和管理您的精美日记模板</p>
              </div>
            </div>
            
            <Link href="/yellowbox/templates/new">
              <Button className="bg-yellow-400 hover:bg-yellow-500 gap-2 shadow-lg shadow-yellow-200/50 text-yellow-900">
                <Plus className="w-4 h-4" />
                新建模板
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-yellow-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
              </div>
              <p className="text-gray-600">正在加载精美模板...</p>
            </motion.div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 bg-yellow-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {templates.length === 0 ? '还没有模板' : '加载失败'}
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={loadTemplates} variant="outline" className="border-yellow-300 hover:bg-yellow-50">
                  重新加载
                </Button>
                {templates.length === 0 && (
                  <Button 
                    onClick={initializeBuiltinTemplates}
                    disabled={isInitializingTemplates}
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                  >
                    {isInitializingTemplates ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        创建中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        创建内置模板
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="w-16 h-16 bg-yellow-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-600/60" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                还没有模板
              </h3>
              <p className="text-gray-600 mb-6">
                创建您的第一个模板，让日记设计更加精彩
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={initializeBuiltinTemplates}
                  disabled={isInitializingTemplates}
                  variant="outline"
                  className="border-yellow-300 hover:bg-yellow-50"
                >
                  {isInitializingTemplates ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      创建内置模板
                    </>
                  )}
                </Button>
                <Link href="/yellowbox/templates/new">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 gap-2 text-yellow-900">
                    <Plus className="w-4 h-4" />
                    自定义模板
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {templates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 border-yellow-200/50 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-1 flex items-center gap-2">
                          {template.name}
                          {template.isBuiltin && (
                            <Badge variant="secondary" className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 border-yellow-200">
                              <Star className="w-3 h-3 mr-1" />
                              内置
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* 模板预览区域 */}
                    <div className="w-full h-32 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 rounded-lg flex items-center justify-center mb-4 border border-yellow-200/50">
                      <div className="text-center text-yellow-600/70">
                        <Sparkles className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-xs">模板预览</span>
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        <span>{template.stats.textShapes} 文本</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        <span>{template.stats.imageShapes} 图片</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/yellowbox/templates/${template.id}/edit`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full gap-2 border-yellow-300 hover:bg-yellow-50">
                          <Edit className="w-3 h-3" />
                          编辑
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteTemplate(template.id, template.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}