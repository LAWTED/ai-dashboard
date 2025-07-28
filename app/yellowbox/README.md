# 🟡 YellowBox - Personal Reflection Platform

YellowBox is a sophisticated AI-powered reflection and journaling platform that provides users with an interactive diary experience featuring time-based reflection prompts, AI conversations, multilingual support, and creative quote generation capabilities.

## ✨ Key Features

### 🕐 Time-Based Reflection System
- **Morning Mode**: Goal-setting and intention prompts (上面的小圆点 ●)
- **Daytime Mode**: Free-form writing ("Write...") (中间的长条 ▬)
- **Evening Mode**: Reflection and gratitude prompts (下面的小圆点 ●)
- **Interactive Time Indicators**: Click the dots in the right sidebar to switch between modes
- **Dynamic Titles**: "Morning Reflection" / "晨间反思" and "Evening Reflection" / "夜间反思"

### 🤖 AI-Powered Conversations  
- Context-aware AI conversations with memory
- Multiple AI providers (OpenAI GPT-4, DeepSeek)
- Streaming responses for real-time interaction
- Intelligent summary generation from conversation history
- Personalized prompts based on time of day

### 🎨 Quote Generation & Design System
- AI-powered quote extraction from diary entries
- **6 Professional Templates**:
  - 简约雅致 (Elegant Simple)
  - 现代简洁 (Modern Clean) 
  - 文学风格 (Literary Style)
  - 禅意简约 (Minimalist Zen)
  - 复古纸张 (Vintage Paper)
  - 海洋微风 (Ocean Breeze)
- High-quality canvas-based export system (PNG format)
- Customizable layouts and typography
- Interactive template carousel with smooth navigation

### 🌍 Multilingual Support (i18n)
- **Bilingual implementation**: English/Chinese (中文/英文)
- Dynamic language switching without page reload
- Cultural adaptation for different writing styles and prompts
- Browser language detection with user preference override
- Type-safe translation system with comprehensive coverage

### 📱 Modern UI/UX
- Responsive design with mobile-first approach
- Smooth animations with Framer Motion
- Interactive time-of-day indicators with visual feedback
- Professional typography system (Serif/Sans/Mono)
- Yellow-themed design with gradient backgrounds

## 🛠️ Technology Stack

### Frontend Technologies
```typescript
// Core Framework
Next.js 15.2.4 + React 19.0.0    // App Router architecture
TypeScript 5.x                   // Full type safety

// Styling & UI
Tailwind CSS 4.0                 // Utility-first styling
Framer Motion 12.17.0            // Animations & transitions
Radix UI Components              // Accessible component library
```

### UI Component Libraries
```typescript
// Radix UI Components
@radix-ui/react-dialog           // Modals & overlays
@radix-ui/react-avatar           // User avatars
@radix-ui/react-scroll-area      // Custom scrollbars
@radix-ui/react-select           // Dropdown selects
@radix-ui/react-tabs             // Tab navigation
@radix-ui/react-tooltip          // Hover tooltips

// Utility Libraries
class-variance-authority         // Component variants
tailwind-scrollbar              // Custom scrollbar styling
useMeasure                      // Element size tracking
```

### Backend & Database
```typescript
// Backend as a Service
Supabase                        // PostgreSQL + Auth + Real-time
Row Level Security (RLS)        // Data protection

// Authentication
Email/Password                  // Built-in auth system
Session Management              // Automatic token refresh
User Preferences               // Persistent settings
```

### AI Integration
```typescript
// AI SDKs
@ai-sdk/openai                  // OpenAI GPT models
@ai-sdk/deepseek               // DeepSeek models  
@ai-sdk/react                  // React-specific utilities

// AI Features
Streaming Responses            // Real-time AI interaction
Context Awareness              // Conversation memory
Multi-Provider Support         // Easy switching between AI providers
```

### State Management & Data Fetching
```typescript
// State Management
React Context API              // Multiple specialized providers
Custom Hooks                   // Reusable logic patterns
Local Storage                  // User preferences persistence

// Data Fetching
React Query (TanStack Query)   // Intelligent caching & sync
Optimistic Updates            // Better UX during mutations
Background Sync               // Keep data fresh
```

## 🏗️ Architecture Patterns

### Context Provider Structure
```typescript
YellowBoxProviders/
├── ReactQueryProvider       // Data fetching & caching
├── YellowBoxErrorBoundary   // Error handling & recovery
└── YellowBoxProviders/
    ├── YellowboxI18nProvider    // Internationalization
    ├── YellowboxAuthProvider    // Authentication state  
    └── YellowboxUIProvider      // UI preferences & time modes
```

### Custom Hooks Architecture
```typescript
// Data Management Hooks
useYellowboxQueries()          // React Query integration
  ├── useDiaryResponse()       // AI conversation API
  ├── useGenerateSummary()     // Summary generation
  ├── useSaveEntries()         // Entry persistence  
  └── useGenerateQuote()       // Quote generation

useYellowboxAnalytics()        // User behavior tracking
useYellowboxErrorHandler()     // Centralized error handling
useKeyboardShortcuts()         // Keyboard navigation (Ctrl+Enter, etc.)

// UI Interaction Hooks  
useYellowBoxAuth()            // Authentication state & actions
useYellowBoxUI()              // UI preferences & time modes
useYellowBoxI18n()            // Internationalization & translations
```

### Component Organization
```typescript
// Core Components
components/yellowbox/
├── ConversationView.tsx      // Chat interface with message history
├── InputSection.tsx          // Text input with voice support
├── SummaryDisplay.tsx        // Dynamic time-based title display
├── QuoteDesignDialog.tsx     // Quote generation interface
└── YellowBoxErrorBoundary.tsx // Error boundary wrapper

// UI Components  
components/ui/
├── carousel.tsx              // Interactive template carousel
├── sliding-number.tsx        // Animated number transitions
├── text-shimmer.tsx          // Loading text effects
└── dialog.tsx                // Modal dialogs

// Page Components
app/yellowbox/
├── page.tsx                  // Main diary interface
├── login/page.tsx           // Authentication page
├── entries/page.tsx         // Entry listing page
├── entries/[id]/page.tsx    // Individual entry view
└── layout.tsx               // Shared layout with sidebar
```

## 🗃️ Database Schema

### YellowBox Entries Table
```sql
CREATE TABLE yellowbox_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entries JSONB NOT NULL,           -- Conversation history & metadata
  metadata JSONB DEFAULT '{}',      -- UI preferences & analytics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE yellowbox_entries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own entries
CREATE POLICY "Users can view own entries" ON yellowbox_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON yellowbox_entries  
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON yellowbox_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON yellowbox_entries
  FOR DELETE USING (auth.uid() = user_id);
```

### Entry Data Structure
```typescript
interface YellowboxEntry {
  id: string
  user_id: string
  entries: {
    selectedQuestion: string                     // Current prompt
    conversationHistory: ConversationMessage[]  // Full chat history
    timeOfDay: "morning" | "daytime" | "evening" // Current time mode
    conversationCount: number                   // Number of exchanges
    completedAt: string                         // ISO timestamp
  }
  metadata: {
    currentFont: "serif" | "sans" | "mono"     // Typography preference
    language: "zh" | "en"                      // Language preference
    totalMessages: number                      // Total message count
    aiSummary?: string                         // Generated summary
    enhancedSummary?: {                        // Rich metadata
      title: string
      tags: string[]
      emotion: {
        primary: string
        intensity: "low" | "medium" | "high"
        confidence: number
      }
      themes: string[]
    }
  }
  created_at: string
  updated_at: string
}

interface ConversationMessage {
  type: "user" | "ai"
  content: string
  timestamp?: string
}
```

## 🔌 API Routes

### Core Endpoints
```typescript
// Entry Management
POST   /api/yellowbox/entries          // Save diary entries
GET    /api/yellowbox/entries          // List entries with pagination  
GET    /api/yellowbox/entries/[id]     // Get specific entry
DELETE /api/yellowbox/entries/[id]     // Delete specific entry

// AI Services
POST   /api/yellowbox/diary-response   // AI conversation
POST   /api/yellowbox/generate-quote   // Quote generation from entries
POST   /api/yellowbox/generate-summary // Summary generation
```

### AI Conversation API
```typescript
// POST /api/yellowbox/diary-response
interface DiaryResponseRequest {
  message: string                              // User input
  conversationHistory: ConversationMessage[]  // Previous messages
  selectedQuestion: string                    // Current prompt
  timeOfDay: "morning" | "daytime" | "evening" // Time context
  userId: string                              // User identifier
}

interface DiaryResponseResponse {
  success: boolean
  response?: string      // AI generated response
  error?: string        // Error message if failed
}
```

### Quote Generation API
```typescript
// POST /api/yellowbox/generate-quote
interface QuoteGenerationRequest {
  entryId: string       // Entry to generate quote from
  template: string      // Template index (0-5)
}

interface QuoteGenerationResponse {
  success: boolean
  quote?: string        // Generated quote text
  error?: string       // Error message if failed
}
```

## 🎯 Key Technical Innovations

### Interactive Time-Switching System
```typescript
// Implementation in SharedSidebar component
function SharedSidebar() {
  const { timeOfDay, setTimeOfDay } = useYellowBoxUI()
  
  const handleTimeOfDayClick = (period: TimeOfDay) => {
    setTimeOfDay(period)  // Updates global context
  }

  return (
    <div className="time-indicators">
      {/* Morning Indicator */}
      <motion.div
        className={`size-1.5 rounded-full cursor-pointer ${
          timeOfDay === "morning" ? "bg-[#2AB186]" : "bg-black"
        }`}
        whileTap={{ scale: 1.5 }}
        onClick={() => handleTimeOfDayClick("morning")}
        title="Morning"
      />
      
      {/* Daytime Indicator */}
      <motion.div
        className={`w-1 h-12 rounded-full cursor-pointer ${
          timeOfDay === "daytime" ? "bg-[#2AB186]" : "bg-black"
        }`}
        whileTap={{ scaleX: 1.5 }}
        onClick={() => handleTimeOfDayClick("daytime")}
        title="Daytime"
      />
      
      {/* Evening Indicator */}
      <motion.div
        className={`size-1.5 rounded-full cursor-pointer ${
          timeOfDay === "evening" ? "bg-[#2AB186]" : "bg-black"
        }`}
        whileTap={{ scale: 1.5 }}
        onClick={() => handleTimeOfDayClick("evening")}
        title="Evening"
      />
    </div>
  )
}
```

### Multilingual Architecture (Type-Safe i18n)
```typescript
// Translation system implementation
export interface YellowboxTranslations {
  // Time-based titles
  morningReflection: string      // "Morning Reflection" / "晨间反思"  
  eveningReflection: string      // "Evening Reflection" / "夜间反思"
  
  // UI Elements
  sparkButton: string           // "Spark" / "启发"
  doneButton: string           // "Done" / "完成"
  
  // Quote generation
  designQuote: string          // "Design Quote" / "设计精彩瞬间"
  quoteExported: string        // "Quote exported" / "引言已导出"
}

// Usage in components
function SummaryDisplay({ timeOfDay, t }) {
  return (
    <motion.h1>
      {timeOfDay === "morning" ? (
        t("morningReflection")        // Type-safe translation
      ) : timeOfDay === "evening" ? (
        t("eveningReflection")
      ) : (
        // Default title
        <>
          {t("titlePart1")}
          <span className="italic">{t("titlePart2")}</span>
          {t("titlePart3")}
        </>  
      )}
    </motion.h1>
  )
}
```

### AI Conversation Engine with Context
```typescript
// Streaming AI responses with context awareness
async function generateAIResponse(request: DiaryResponseRequest) {
  const { message, conversationHistory, timeOfDay, selectedQuestion } = request
  
  // Build context-aware prompt
  const systemPrompt = buildSystemPrompt(timeOfDay, selectedQuestion)
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content
    })),
    { role: "user", content: message }
  ]

  // Stream response from AI provider
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    temperature: 0.7,
    maxTokens: 500
  })

  return result.toTextStreamResponse()
}
```

### Canvas-Based Quote Export System
```typescript
// High-quality quote image generation
async function exportQuote(quote: string, template: QuoteTemplate) {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  
  // High-DPI scaling for crisp output
  const devicePixelRatio = window.devicePixelRatio || 1
  const scale = Math.max(devicePixelRatio, 2) * 2
  const cardWidth = 600
  const cardHeight = 400

  canvas.width = cardWidth * scale
  canvas.height = cardHeight * scale
  ctx.scale(scale, scale)

  // Render gradient background
  const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight)
  template.gradientStops.forEach(({ color, position }) => {
    gradient.addColorStop(position, color)
  })
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, cardWidth, cardHeight)

  // Render text with word wrapping
  ctx.font = `${template.fontSize}px ${template.fontFamily}`
  ctx.fillStyle = template.textColor
  
  const words = quote.split(" ")
  const lines = wrapText(words, cardWidth - 100, ctx)
  
  lines.forEach((line, index) => {
    const y = (cardHeight - lines.length * template.lineHeight) / 2 + 
              (index + 1) * template.lineHeight
    ctx.fillText(line, cardWidth / 2, y)
  })

  // Export as PNG
  const link = document.createElement("a")
  link.download = `quote-${Date.now()}.png`
  link.href = canvas.toDataURL("image/png")
  link.click()
}
```

## 🚀 Recent Enhancements

### ✅ Time-Switching Indicators Restoration (v2.1)
- **Problem**: Time indicators were marked as "static" and non-functional
- **Solution**: Restored interactive functionality with context integration
- **Features**:
  - Click animations with `whileTap` scale effects
  - Visual feedback with color transitions (black ↔ green)
  - Dynamic title updates ("Morning Reflection" / "Evening Reflection")
  - Context persistence across page navigation

### ✅ Improved Internationalization System (v2.0)
- **Problem**: Hardcoded multilingual strings using ternary operators
- **Solution**: Comprehensive i18n system with type safety
- **Improvements**:
  - Replaced `lang === "zh" ? "中文" : "English"` patterns
  - Added type-safe translation keys with TypeScript
  - Centralized translation management
  - Enhanced language switching with context preservation

### ✅ Context Architecture Refactoring (v1.9)
- **Problem**: Monolithic context with performance issues
- **Solution**: Modular provider architecture
- **Benefits**:
  - Separation of concerns (Auth / UI / i18n)
  - Optimized re-rendering with selective updates
  - Enhanced error handling with boundaries
  - Improved maintainability and testability

## 🔧 Development Commands

```bash
# Development
pnpm dev                    # Start development server (localhost:3000)
pnpm build                  # Build for production
pnpm start                  # Start production server

# Code Quality  
pnpm lint                   # Run ESLint checks
pnpm lint:fix              # Auto-fix ESLint issues
pnpm type-check            # TypeScript compilation check

# Database (if using local Supabase)
pnpm db:reset              # Reset local database
pnpm db:migrate            # Run pending migrations
pnpm db:seed               # Populate with sample data
```

## 📈 Performance Optimizations

### Data Fetching & Caching
```typescript
// React Query configuration for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: false,    // Reduce unnecessary requests
      retry: 3,                       // Retry failed requests
    },
    mutations: {
      retry: 1,                       // Retry failed mutations once
    },
  },
})

// Optimistic updates for better UX
const saveEntryMutation = useMutation({
  mutationFn: saveEntry,
  onMutate: async (newEntry) => {
    // Cancel in-flight queries
    await queryClient.cancelQueries(['entries'])
    
    // Snapshot previous value
    const previousEntries = queryClient.getQueryData(['entries'])
    
    // Optimistically update cache
    queryClient.setQueryData(['entries'], old => [...old, newEntry])
    
    return { previousEntries }
  },
  onError: (err, newEntry, context) => {
    // Rollback on error
    queryClient.setQueryData(['entries'], context.previousEntries)
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries(['entries'])
  },
})
```

### Component Optimizations
- **React.memo()** for expensive components
- **useCallback()** for stable function references
- **useMemo()** for expensive calculations
- **Lazy loading** for route-based code splitting
- **Image optimization** with Next.js Image component

### Bundle Optimizations
- **Automatic code splitting** by Next.js
- **Tree shaking** for unused code elimination
- **Dynamic imports** for feature-based splitting
- **Compression** with gzip/brotli
- **CDN optimization** for static assets

## 🔮 Future Roadmap

### Planned Features
- [ ] **Real-time Collaboration** - Multi-user diary sharing with Supabase Realtime
- [ ] **Advanced Analytics** - Personal reflection insights and patterns
- [ ] **Voice Integration** - Voice-to-text diary entries with Web Speech API
- [ ] **Export Formats** - PDF, EPUB, and Markdown export options
- [ ] **Offline Support** - Service worker for offline functionality
- [ ] **Advanced Templates** - More quote design options and customization
- [ ] **Reminder System** - Smart notifications for reflection times
- [ ] **Data Export** - Full data export in JSON/CSV formats

### Technical Improvements
- [ ] **Comprehensive Testing** - Unit, integration, and E2E test suites
- [ ] **Performance Monitoring** - Real-time performance tracking with Web Vitals
- [ ] **API Documentation** - OpenAPI/Swagger documentation for all endpoints
- [ ] **Enhanced Error Monitoring** - Integration with Sentry or similar services
- [ ] **Advanced State Management** - Migration to Zustand for complex state scenarios
- [ ] **Database Optimization** - Query optimization and indexing strategies
- [ ] **Security Enhancements** - Additional security headers and validations

### UX/UI Enhancements
- [ ] **Dark Mode Support** - System-aware theme switching
- [ ] **Accessibility Improvements** - Enhanced screen reader support
- [ ] **Mobile App** - React Native version for mobile platforms
- [ ] **Progressive Web App** - PWA features for app-like experience
- [ ] **Advanced Animations** - More sophisticated micro-interactions
- [ ] **Customizable Themes** - User-defined color schemes and layouts

## 🤝 Contributing

This YellowBox platform is part of Stanford University research activities. The codebase follows these principles:

### Code Style Guidelines
- **TypeScript First** - All new code must be fully typed
- **Component Composition** - Prefer composition over inheritance  
- **Hook-Based Logic** - Use custom hooks for reusable logic
- **Error Boundaries** - Wrap components in error boundaries
- **Accessibility** - Ensure WCAG 2.1 AA compliance

### Development Workflow
1. **Feature Branches** - Create feature branches from `main`
2. **Type Safety** - Ensure all TypeScript checks pass
3. **Code Review** - All changes require review
4. **Testing** - Add tests for new functionality
5. **Documentation** - Update README and inline docs

### Performance Standards
- **Core Web Vitals** - Maintain excellent performance scores
- **Bundle Size** - Monitor and optimize bundle size
- **Runtime Performance** - Profile and optimize re-renders
- **Accessibility** - Test with screen readers and keyboard navigation

---

## 📄 License & Academic Use

This YellowBox platform is developed as part of Stanford University research activities. Please respect intellectual property and research guidelines when referencing or building upon this work.

**Built with ❤️ at Stanford University**  
*Powered by Next.js, TypeScript, Supabase & AI*