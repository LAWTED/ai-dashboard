/**
 * 模板存储层 - MVP 简化版本
 * 直接使用标准 Supabase 操作，无复杂封装
 */

import { createClient } from '@/lib/supabase/client';
import { 
  Template, 
  TemplateRecord, 
  CreateTemplateRequest,
  TemplateListItem,
  Result 
} from './types/template';
import { TemplateEngine } from './template-engine';

/**
 * 模板存储操作类
 */
export class TemplateStorage {

  /**
   * 获取所有模板（用于列表展示）
   */
  static async listTemplates(): Promise<Result<TemplateListItem[]>> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('yellowbox_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const templates: TemplateListItem[] = (data || []).map(record => ({
        id: record.id,
        name: record.name,
        description: record.description || '',
        createdAt: record.created_at,
        isBuiltin: record.user_id === null,
        stats: TemplateEngine.getTemplateStats(record.snapshot)
      }));

      return {
        success: true,
        data: templates
      };
    } catch (error) {
      console.error('List templates error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取模板列表失败'
      };
    }
  }

  /**
   * 根据ID获取完整模板
   */
  static async getTemplate(templateId: string): Promise<Result<Template>> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('yellowbox_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('模板不存在');

      const template: Template = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        snapshot: data.snapshot,
        userId: data.user_id,
        isPublic: data.is_public,
        createdAt: data.created_at
      };

      return {
        success: true,
        data: template
      };
    } catch (error) {
      console.error('Get template error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取模板失败'
      };
    }
  }

  /**
   * 创建新模板
   */
  static async createTemplate(request: CreateTemplateRequest, userId?: string): Promise<Result<string>> {
    try {
      const supabase = createClient();

      // 验证 snapshot 格式
      if (!request.snapshot?.store || !request.snapshot?.schema) {
        return {
          success: false,
          error: '无效的模板格式：缺少必要的 store 或 schema 数据'
        };
      }

      const templateData: Partial<TemplateRecord> = {
        name: request.name.trim(),
        description: request.description?.trim() || null,
        snapshot: request.snapshot,
        user_id: userId || null,
        is_public: request.isPublic ?? false
      };

      const { data, error } = await supabase
        .from('yellowbox_templates')
        .insert(templateData)
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data.id
      };
    } catch (error) {
      console.error('Create template error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建模板失败'
      };
    }
  }

  /**
   * 更新模板
   */
  static async updateTemplate(
    templateId: string, 
    updates: Partial<CreateTemplateRequest>,
    userId?: string
  ): Promise<Result<void>> {
    try {
      const supabase = createClient();

      // 构建更新数据
      const updateData: Partial<TemplateRecord> = {};
      
      if (updates.name !== undefined) {
        updateData.name = updates.name.trim();
      }
      
      if (updates.description !== undefined) {
        updateData.description = updates.description?.trim() || null;
      }
      
      if (updates.snapshot !== undefined) {
        if (!updates.snapshot?.store || !updates.snapshot?.schema) {
          return {
            success: false,
            error: '无效的模板格式：缺少必要的 store 或 schema 数据'
          };
        }
        updateData.snapshot = updates.snapshot;
      }
      
      if (updates.isPublic !== undefined) {
        updateData.is_public = updates.isPublic;
      }

      // 构建查询条件
      let query = supabase
        .from('yellowbox_templates')
        .update(updateData)
        .eq('id', templateId);

      // 如果提供了 userId，确保只能更新自己的模板
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;
      
      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Update template error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新模板失败'
      };
    }
  }

  /**
   * 删除模板
   */
  static async deleteTemplate(templateId: string, userId?: string): Promise<Result<void>> {
    try {
      const supabase = createClient();

      // 构建查询条件
      let query = supabase
        .from('yellowbox_templates')
        .delete()
        .eq('id', templateId);

      // 如果提供了 userId，确保只能删除自己的模板
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;
      
      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Delete template error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除模板失败'
      };
    }
  }

  /**
   * 检查模板名称是否可用
   */
  static async isNameAvailable(name: string, excludeId?: string): Promise<Result<boolean>> {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('yellowbox_templates')
        .select('id')
        .eq('name', name.trim());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return {
        success: true,
        data: (data || []).length === 0
      };
    } catch (error) {
      console.error('Check name availability error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '检查名称可用性失败'
      };
    }
  }

  /**
   * 批量创建内置模板
   */
  static async createBuiltinTemplates(templates: CreateTemplateRequest[]): Promise<Result<string[]>> {
    try {
      const supabase = createClient();

      const templateData: Partial<TemplateRecord>[] = templates.map(template => ({
        name: template.name.trim(),
        description: template.description?.trim() || null,
        snapshot: template.snapshot,
        user_id: null, // 内置模板没有用户ID
        is_public: true // 内置模板都是公开的
      }));

      const { data, error } = await supabase
        .from('yellowbox_templates')
        .insert(templateData)
        .select('id');

      if (error) throw error;

      const ids = (data || []).map(record => record.id);

      return {
        success: true,
        data: ids
      };
    } catch (error) {
      console.error('Create builtin templates error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建内置模板失败'
      };
    }
  }
}