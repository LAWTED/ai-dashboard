import { PromptModule } from './types';

/**
 * Class responsible for composing a complete prompt from individual modules.
 * This is a pure utility that has no knowledge of business logic or specific use cases.
 */
export class PromptComposer {
  /**
   * Composes a complete prompt from a list of modules.
   * Simply concatenates all enabled modules in the order provided.
   *
   * @param modules - Array of modules to compose
   * @returns The composed prompt text
   */
  compose(modules: PromptModule[]): string {
    // Filter out disabled modules
    const enabledModules = modules.filter(module => module.enabled !== false);

    // Group modules by type
    const groupedModules: Record<string, PromptModule[]> = {};
    enabledModules.forEach(module => {
      if (!groupedModules[module.type]) {
        groupedModules[module.type] = [];
      }
      groupedModules[module.type].push(module);
    });

    // Sort modules within each group by priority (descending)
    Object.values(groupedModules).forEach(moduleList => {
      moduleList.sort((a, b) => {
        const priorityA = a.priority ?? 0;
        const priorityB = b.priority ?? 0;
        return priorityB - priorityA; // Higher priority first
      });
    });

    // Build the prompt by concatenating all module content
    let prompt = '';

    // Add content from each module group
    Object.entries(groupedModules).forEach(([type, moduleList]) => {
      prompt += `## ${type.replace('_', ' ')}\n`;

      moduleList.forEach(module => {
        prompt += `### ${module.name.replace('_', ' ').toUpperCase()}\n${module.text}\n\n`;
      });
    });

    return prompt;
  }
}