import { ModuleType, PromptModule } from './types';

/**
 * Creates a module with default values filled in.
 * This is a convenience function to create new modules with less boilerplate.
 *
 * @param type - The module type
 * @param name - The module name
 * @param text - The module content
 * @param options - Optional module properties
 * @returns A PromptModule object
 */
export function createModule(
  type: ModuleType,
  name: string,
  text: string,
  options?: Partial<PromptModule>
): PromptModule {
  return {
    type,
    name,
    text,
    priority: 50,
    enabled: true,
    ...options
  };
}