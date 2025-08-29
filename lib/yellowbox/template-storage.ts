/**
 * 模板存储层 - MVP 版本
 * 只使用 Supabase，移除文件系统复杂性
 */

import { createClient as createClientClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { 
  Template, 
  TemplateRecord, 
  CreateTemplateRequest, 
  UpdateTemplateRequest, 
  TemplateListOptions,
  TldrawSnapshot,
  TldrawDocument,
  TldrawRecord,
  Result
} from './types/template';

/**
 * 模板存储类
 */
export class TemplateStorage {
  /**
   * 获取单个模板
   */
  static async getTemplate(
    id: string, 
    useServerClient: boolean = false
  ): Promise<Result<Template>> {
    try {
      const supabase = useServerClient ? await createServerClient() : createClientClient();
      
      const { data, error } = await supabase
        .from('yellowbox_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: `模板 ${id} 未找到` };
        }
        return { success: false, error: error.message };
      }

      const template = this.recordToTemplate(data);
      return { success: true, data: template };
    } catch (error) {
      console.error(`获取模板 ${id} 时出错:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  }

  /**
   * 获取模板列表
   */
  static async listTemplates(
    options: TemplateListOptions = {},
    useServerClient: boolean = false
  ): Promise<Template[]> {
    try {
      const supabase = useServerClient ? await createServerClient() : createClientClient();
      
      let query = supabase
        .from('yellowbox_templates')
        .select('*')
        .order('created_at', { ascending: false });

      // 应用过滤条件
      if (options.publicOnly) {
        query = query.eq('is_public', true);
      }

      if (options.ownOnly) {
        // 当前用户的模板（需要认证）
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return [];
        }
        query = query.eq('user_id', user.id);
      }

      // 应用分页
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(record => this.recordToTemplate(record));
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  /**
   * 创建新模板
   */
  static async createTemplate(
    request: CreateTemplateRequest,
    useServerClient: boolean = false
  ): Promise<Template | null> {
    try {
      const supabase = useServerClient ? await createServerClient() : createClientClient();
      
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('yellowbox_templates')
        .insert({
          name: request.name,
          description: request.description,
          snapshot: request.snapshot,
          replaceable_shapes: request.replaceableShapes || [],
          is_public: request.isPublic || false,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.recordToTemplate(data);
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  }

  /**
   * 更新模板
   */
  static async updateTemplate(
    id: string,
    request: UpdateTemplateRequest,
    useServerClient: boolean = false
  ): Promise<Template | null> {
    try {
      const supabase = useServerClient ? await createServerClient() : createClientClient();
      
      // 构建更新对象（只包含提供的字段）
      const updateData: Partial<TemplateRecord> = {};
      if (request.name !== undefined) updateData.name = request.name;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.snapshot !== undefined) updateData.snapshot = request.snapshot;
      if (request.replaceableShapes !== undefined) updateData.replaceable_shapes = request.replaceableShapes;
      if (request.isPublic !== undefined) updateData.is_public = request.isPublic;

      const { data, error } = await supabase
        .from('yellowbox_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.recordToTemplate(data);
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      return null;
    }
  }

  /**
   * 删除模板
   */
  static async deleteTemplate(
    id: string,
    useServerClient: boolean = false
  ): Promise<boolean> {
    try {
      const supabase = useServerClient ? await createServerClient() : createClientClient();
      
      const { error } = await supabase
        .from('yellowbox_templates')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      return false;
    }
  }

  /**
   * 检查模板是否存在
   */
  static async templateExists(
    id: string,
    useServerClient: boolean = false
  ): Promise<boolean> {
    try {
      const supabase = useServerClient ? await createServerClient() : createClientClient();
      
      const { data, error } = await supabase
        .from('yellowbox_templates')
        .select('id')
        .eq('id', id)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * 获取用户模板数量
   */
  static async getUserTemplateCount(
    userId: string,
    useServerClient: boolean = false
  ): Promise<number> {
    try {
      const supabase = useServerClient ? await createServerClient() : createClientClient();
      
      const { count, error } = await supabase
        .from('yellowbox_templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error(`Error getting template count for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * 获取公开模板数量
   */
  static async getPublicTemplateCount(
    useServerClient: boolean = false
  ): Promise<number> {
    try {
      const supabase = useServerClient ? await createServerClient() : createClientClient();
      
      const { count, error } = await supabase
        .from('yellowbox_templates')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting public template count:', error);
      return 0;
    }
  }

  // ====================== 私有辅助方法 ======================

  /**
   * 将数据库记录转换为 Template 对象
   */
  private static recordToTemplate(record: TemplateRecord): Template {
    return {
      id: record.id,
      name: record.name,
      description: record.description || '',
      snapshot: this.parseSnapshot(record.snapshot),
      replaceableShapes: record.replaceable_shapes || [],
      previewUrl: record.preview_url || undefined,
      userId: record.user_id || undefined,
      isPublic: record.is_public,
      createdAt: record.created_at,
    };
  }

  /**
   * 解析快照数据
   */
  private static parseSnapshot(snapshotData: unknown): TldrawSnapshot {
    if (!snapshotData) {
      return { document: { store: {} } };
    }

    const data = snapshotData as Record<string, unknown>;
    
    // 如果已经是正确格式，直接返回
    if (data.document) {
      return data as unknown as TldrawSnapshot;
    }

    // 兼容旧格式：直接包含 store 的数据
    if (data.store) {
      return {
        document: data as unknown as TldrawDocument
      };
    }

    // 其他格式，尝试包装
    return {
      document: {
        store: data as unknown as Record<string, TldrawRecord>
      }
    };
  }
}

/**
 * 模板验证工具
 */
export class TemplateValidator {
  /**
   * 验证模板名称
   */
  static validateName(name: string): { valid: boolean; error?: string } {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Template name is required' };
    }
    
    if (name.trim().length === 0) {
      return { valid: false, error: 'Template name cannot be empty' };
    }
    
    if (name.length > 100) {
      return { valid: false, error: 'Template name is too long (max 100 characters)' };
    }
    
    return { valid: true };
  }

  /**
   * 验证模板描述
   */
  static validateDescription(description: string): { valid: boolean; error?: string } {
    if (description && description.length > 500) {
      return { valid: false, error: 'Template description is too long (max 500 characters)' };
    }
    
    return { valid: true };
  }

  /**
   * 验证快照数据
   */
  static validateSnapshot(snapshot: TldrawSnapshot): { valid: boolean; error?: string } {
    if (!snapshot || typeof snapshot !== 'object') {
      return { valid: false, error: 'Invalid snapshot format' };
    }
    
    if (!snapshot.document || typeof snapshot.document !== 'object') {
      return { valid: false, error: 'Snapshot must contain document data' };
    }
    
    if (!snapshot.document.store || typeof snapshot.document.store !== 'object') {
      return { valid: false, error: 'Snapshot document must contain store data' };
    }
    
    return { valid: true };
  }

  /**
   * 验证可替换形状列表
   */
  static validateReplaceableShapes(shapes: string[]): { valid: boolean; error?: string } {
    if (!Array.isArray(shapes)) {
      return { valid: false, error: 'Replaceable shapes must be an array' };
    }
    
    for (const shapeId of shapes) {
      if (typeof shapeId !== 'string' || shapeId.trim().length === 0) {
        return { valid: false, error: 'All shape IDs must be non-empty strings' };
      }
    }
    
    return { valid: true };
  }
}