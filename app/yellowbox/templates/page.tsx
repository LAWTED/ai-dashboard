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
  Sparkles
} from "lucide-react";
import Link from "next/link";
// import { createClient } from '@/lib/supabase/client'; // 不再直接使用，改为使用 TemplateStorage
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Template } from '@/lib/yellowbox/types/template';
// import { TemplateStorage } from '@/lib/yellowbox/template-storage'; // 服务端组件，不能在客户端使用
// import { TemplateEngine } from '@/lib/yellowbox/template-engine'; // 包含服务端依赖

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 使用 API 调用而不是直接调用存储层
      const response = await fetch('/api/yellowbox/templates');
      if (!response.ok) {
        throw new Error('加载模板失败');
      }
      
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      const errorMessage = err instanceof Error ? err.message : '加载模板失败';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

  const getTemplateStats = (template: Template) => {
    // 简化统计，直接使用模板中的信息
    const store = template.snapshot?.document?.store || {};
    const shapes = Object.values(store);
    
    return {
      text: shapes.filter(shape => 
        shape && typeof shape === 'object' && 'typeName' in shape && 
        shape.typeName === 'shape' && 'type' in shape && shape.type === 'text'
      ).length,
      image: shapes.filter(shape => 
        shape && typeof shape === 'object' && 'typeName' in shape && 
        shape.typeName === 'shape' && 'type' in shape && shape.type === 'image'
      ).length,
      replaceable: template.replaceableShapes?.length || 0
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-600" />
                  模板中心
                </h1>
                <p className="text-gray-600">创建和管理您的自定义模板</p>
              </div>
            </div>
            
            <Link href="/yellowbox/templates/new">
              <Button className="bg-yellow-600 hover:bg-yellow-700 gap-2">
                <Plus className="w-4 h-4" />
                新建模板
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-gray-600">正在加载模板...</p>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              还没有模板
            </h3>
            <p className="text-gray-600 mb-6">
              创建您的第一个自定义模板，让日记设计更加精彩
            </p>
            <Link href="/yellowbox/templates/new">
              <Button className="bg-yellow-600 hover:bg-yellow-700 gap-2">
                <Plus className="w-4 h-4" />
                创建第一个模板
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const shapes = getTemplateStats(template);
              
              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold line-clamp-1">
                            {template.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            <Type className="w-3 h-3 mr-1" />
                            {shapes.text}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Image className="w-3 h-3 mr-1" />
                            {shapes.image}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* 模板预览区域 */}
                      <div className="w-full h-32 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 rounded-lg flex items-center justify-center mb-4 border border-yellow-200">
                        <div className="text-center text-gray-500">
                          <Sparkles className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-xs">模板预览</span>
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/yellowbox/templates/${template.id}/edit`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <Edit className="w-3 h-3" />
                            编辑
                          </Button>
                        </Link>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteTemplate(template.id, template.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* 创建时间 */}
                      <p className="text-xs text-gray-400 mt-2">
                        创建于 {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}