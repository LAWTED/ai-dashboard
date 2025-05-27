/**
 * Types and interfaces for the modular prompt system.
 * This system allows for building complex prompts from reusable, configurable modules.
 */

/**
 * Interface representing a modular component of a professor's system prompt.
 * Each module contains a specific piece of information that can be combined
 * with others to create a complete system prompt.
 */
export interface PromptModule {
  /**
   * The type/category of the module (e.g., 'Basic_Info', 'Research_Profile').
   * Used for grouping related modules together.
   */
  type: string;

  /**
   * Descriptive name of this specific module.
   * Should be unique within its type.
   */
  name: string;

  /**
   * The actual content of the module that will be included in the system prompt.
   * This should be the final text without any template variables.
   */
  text: string;

  /**
   * Priority value that determines the order of modules within the same type.
   * Higher values indicate higher priority (will appear earlier).
   * Default is 0 if not specified.
   */
  priority?: number;

  /**
   * Whether this module should be included in the prompt generation.
   * Allows for easy enabling/disabling of modules without removing them.
   * Default is true if not specified.
   */
  enabled?: boolean;
}

/**
 * Represents a professor with their collection of prompt modules.
 */
export interface ProfessorPrompt {
  /**
   * Unique identifier for the professor.
   */
  id: string;

  /**
   * The professor's full name.
   */
  name: string;

  /**
   * Collection of prompt modules associated with this professor.
   */
  modules: PromptModule[];
}

/**
 * Module types for categorizing different parts of a professor's prompt.
 */
export enum ModuleType {
  SYSTEM_PROMPT = 'System_Prompt',
  BASIC_INFO = 'Basic_Info',
  RESEARCH_PROFILE = 'Research_Profile',
  PUBLICATIONS = 'Publications',
  CONVERSATION_GUIDELINES = 'Conversation_Guidelines',
  TEACHING_STYLE = 'Teaching_Style',
  GOALS = 'Goals',
}