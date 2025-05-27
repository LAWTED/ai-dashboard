# Modular Prompt System

A modular prompt system that allows building complex professor prompts from reusable, configurable components. Built with TypeScript for type safety and flexible APIs.

## Core Design Philosophy

The system follows a **completely modular and decoupled** design:
- **Composer**: Pure module assembly tool with no business logic
- **Modules**: All content (including system prompts) are reusable modules
- **Settings Separation**: Generic settings separated from professor-specific content
- **Flexible Composition**: Free mixing and matching of any modules
- **Direct Imports**: No index files - import directly from specific files

## Architecture Overview

```
lib/prompt/
├── types.ts              # Core type definitions
├── composer.ts           # Pure module assembler
├── utils.ts             # Utility functions
├── professors/          # Professor-related modules
│   ├── settings.ts      # Generic settings (system prompts, etc.)
│   ├── feifei-li.ts    # Fei-Fei Li specific modules
│   └── geoffrey-cohen.ts # Geoffrey L. Cohen specific modules
└── README.md            # System documentation
```

## Core Concepts

### 1. Prompt Modules (PromptModule)

Each module represents a component part of the prompt with the following properties:

- **type**: Module type (e.g., 'System_Prompt', 'Basic_Info', 'Research_Profile')
- **name**: Module name, should be unique within its type
- **text**: Module content, should be final text
- **priority**: Priority value determining order within same type (optional, defaults to 0)
- **enabled**: Whether this module should be included (optional, defaults to true)

### 2. Generic Settings Modules

Located in `professors/settings.ts`, contains reusable module creation functions:

```typescript
// Create standard system prompt
createSystemPromptModule(professorName: string)

// Create research assistant system prompt
createRASystemPromptModule(professorName: string)

// Create teaching system prompt
createTeachingSystemPromptModule(professorName: string)

// Create generic guidance modules
createRAGuidanceModule()
createTeachingGuidelinesModule()
```

### 3. Professor-Specific Modules

Each professor has an independent file (like `feifei-li.ts`) containing only their unique content:
- Personal background
- Research interests
- Publications
- Unique teaching styles

## Usage

### 1. Import Modules

```typescript
import { ModuleType, ProfessorPrompt } from '@/lib/prompt/types';
import { PromptComposer } from '@/lib/prompt/composer';

// Import specific professors
import { feifeiLi, feifeiLiRA } from '@/lib/prompt/professors/feifei-li';

// Import generic settings
import { createSystemPromptModule } from '@/lib/prompt/professors/settings';
```

### 2. Use Predefined Professors

```typescript
const composer = new PromptComposer();

// Use standard configuration
const prompt = composer.compose(feifeiLi.modules);

// Use research assistant version
const raPrompt = composer.compose(feifeiLiRA.modules);

// Use only specific module types
const researchModules = feifeiLi.modules.filter(module =>
  [ModuleType.SYSTEM_PROMPT, ModuleType.RESEARCH_PROFILE].includes(module.type as ModuleType)
);
const researchPrompt = composer.compose(researchModules);
```

### 3. Create Custom Professor Configurations

```typescript
import {
  personalBackgroundModule,
  researchInterestsModule
} from '@/lib/prompt/professors/feifei-li';
import { createSystemPromptModule } from '@/lib/prompt/professors/settings';

const customProfessor: ProfessorPrompt = {
  id: "custom-expert",
  name: "Custom Expert",
  modules: [
    createSystemPromptModule("Custom Expert"),
    personalBackgroundModule,
    researchInterestsModule,
    // Add custom modules...
  ]
};

const composer = new PromptComposer();
const customPrompt = composer.compose(customProfessor.modules);
```

### 4. Mix Modules from Different Professors

```typescript
import { researchInterestsModule } from '@/lib/prompt/professors/feifei-li';
import { teachingApproachModule } from '@/lib/prompt/professors/geoffrey-cohen';
import { createSystemPromptModule } from '@/lib/prompt/professors/settings';

const hybridExpert: ProfessorPrompt = {
  id: "hybrid-expert",
  name: "Hybrid Expert",
  modules: [
    createSystemPromptModule("Hybrid Expert"),
    // Fei-Fei Li's technical background
    researchInterestsModule,
    // Geoffrey Cohen's teaching methods
    teachingApproachModule
  ]
};

const composer = new PromptComposer();
const hybridPrompt = composer.compose(hybridExpert.modules);
```

### 5. Create New Professor Files

Create an independent file `professors/new-professor.ts` for new professors:

```typescript
import { ModuleType, ProfessorPrompt, PromptModule } from '../types';
import { createSystemPromptModule } from './settings';

const PROFESSOR_NAME = "New Professor";

// Define professor-specific modules
export const personalBackgroundModule: PromptModule = {
  type: ModuleType.BASIC_INFO,
  name: "personal_background",
  text: "Professor's personal background...",
  priority: 100,
  enabled: true
};

// Export different configurations
export const newProfessor: ProfessorPrompt = {
  id: "new-professor",
  name: PROFESSOR_NAME,
  modules: [
    createSystemPromptModule(PROFESSOR_NAME),
    personalBackgroundModule,
    // Other modules...
  ]
};
```

## Core Design Principles

1. **Complete Business Agnosticism**: Composer contains no domain-specific logic
2. **Settings vs Content Separation**: Generic settings independent of specific professor content
3. **Modularity**: All content is composable modules
4. **Flexibility**: Free combination of any module lists
5. **Type Safety**: Complete TypeScript type checking
6. **Reusability**: Modules can be shared and reused across different configurations
7. **Extensibility**: New professors and module types are easy to add
8. **Direct Imports**: No index files - import directly from specific files for clarity

## Available Professors

### Fei-Fei Li
- **Standard**: Complete configuration with all modules
- **Research Assistant**: Focused on research guidance
- **Teaching**: Focused on teaching and instruction
- **Basic**: Minimal configuration with core info only

### Geoffrey L. Cohen
- **Standard**: Complete configuration with all modules
- **Teaching**: Focused on educational psychology and mentoring
- **Basic**: Minimal configuration with core info only

## File Organization

- **Core System**: `types.ts`, `composer.ts`, `utils.ts`
- **Generic Settings**: `professors/settings.ts`
- **Professor Modules**: `professors/{professor-name}.ts` (e.g., `feifei-li.ts`, `geoffrey-cohen.ts`)

Each file has a clear responsibility, import paths point directly to specific files, avoiding the complexity of intermediate layers.

This architecture ensures system maintainability, extensibility, and reusability.