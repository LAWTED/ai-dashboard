# AI Dashboard - Stanford Research Platform

A comprehensive AI-powered educational platform built with Next.js 15, featuring multiple research projects and intelligent applications for academic support and personal development.

## 🏗️ Architecture Overview

This repository contains multiple research projects spanning AI-powered educational tools, data analysis systems, and academic support applications, with **YellowBox** being the flagship personal reflection platform.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Project Structure

### Key Projects

- **🟡 YellowBox** (`/app/yellowbox/`) - AI-powered reflection and journaling platform
- **🤖 Alice AI** (`/app/(dashboard)/alice/`) - Graduate school guidance chatbot
- **🎮 PUA Game** (`/app/(dashboard)/pua-game/`) - Social interaction simulation
- **📄 Paper System** (`/app/paper/`) - Interactive document management
- **📧 Social Journal** (`/app/social-journal/`) - 3D social interaction platform

---

# 🟡 YellowBox - Personal Reflection Platform

YellowBox is a sophisticated AI-powered reflection and journaling platform that provides users with an interactive diary experience featuring time-based reflection prompts, AI conversations, multilingual support, and creative quote generation capabilities.

## ✨ Key Features

### 🕐 Time-Based Reflection System
- **Morning Mode**: Goal-setting and intention prompts
- **Daytime Mode**: Free-form writing ("Write...")  
- **Evening Mode**: Reflection and gratitude prompts
- **Interactive Time Indicators**: Click the dots in the sidebar to switch between modes

### 🤖 AI-Powered Conversations  
- Context-aware AI conversations with memory
- Multiple AI providers (OpenAI, DeepSeek)
- Streaming responses for real-time interaction
- Intelligent summary generation

### 🎨 Quote Generation & Design
- AI-powered quote extraction from diary entries
- 6 professional templates with gradient backgrounds
- High-quality canvas-based export system
- Customizable layouts and typography

### 🌍 Multilingual Support
- Bilingual implementation (English/Chinese)
- Dynamic language switching
- Cultural adaptation for different writing styles
- Browser language detection

### 📱 Modern UI/UX
- Responsive design with mobile-first approach
- Smooth animations with Framer Motion
- Interactive time-of-day indicators
- Professional typography and layouts

## 🛠️ Technology Stack

### Frontend Technologies
- **Next.js 15.2.4** with **React 19.0.0** - App Router architecture
- **TypeScript** - Full type safety throughout the application
- **Tailwind CSS 4.0** - Utility-first styling with PostCSS
- **Framer Motion 12.17.0** - Smooth animations and micro-interactions
- **Radix UI** - Comprehensive accessible component library

### UI Components & Styling
```typescript
// Component libraries used
@radix-ui/react-dialog, @radix-ui/react-avatar, @radix-ui/react-scroll-area
@radix-ui/react-select, @radix-ui/react-tabs, @radix-ui/react-tooltip

// Styling utilities  
class-variance-authority - Component variants
tailwind-scrollbar - Custom scrollbar styling
```

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Authentication** - Email/password with session management
- **Real-time capabilities** - Built-in support for live updates
- **Row Level Security (RLS)** - Data protection at database level

### AI Integration
```typescript
// AI SDKs
@ai-sdk/openai     // OpenAI GPT models
@ai-sdk/deepseek   // DeepSeek models  
@ai-sdk/react      // React-specific AI utilities
```

### State Management & Data Fetching
- **React Context API** - Multiple specialized providers
- **React Query** - Efficient data fetching and caching
- **Custom Hooks** - Reusable logic patterns
- **Local Storage** - User preferences persistence

## 🏗️ Architecture Patterns

### Context Provider Structure
```
YellowboxProviders/
├── YellowboxI18nProvider    # Internationalization
├── YellowboxAuthProvider    # Authentication state  
├── YellowboxUIProvider      # UI preferences & themes
└── ReactQueryProvider       # Data fetching & caching
```

### Custom Hooks Architecture
```typescript
// Data management hooks
useYellowboxQueries          // React Query integration
useYellowboxAnalytics        // User behavior tracking
useYellowboxErrorHandler     // Centralized error handling
useKeyboardShortcuts         // Keyboard navigation

// UI interaction hooks  
useYellowBoxAuth            // Authentication state
useYellowBoxUI              // UI preferences & time modes
useYellowBoxI18n            // Internationalization
```

### Component Organization
```
components/yellowbox/
├── ConversationView.tsx     # Chat interface
├── InputSection.tsx         # Text input with voice support
├── SummaryDisplay.tsx       # Dynamic title display
└── QuoteDesignDialog.tsx    # Quote generation interface

components/ui/
├── carousel.tsx             # Interactive image carousel
├── sliding-number.tsx       # Animated number transitions
└── text-shimmer.tsx         # Loading text effects
```

## 🗃️ Database Schema

### YellowBox Entries Table
```sql
yellowbox_entries {
  id: uuid PRIMARY KEY
  user_id: uuid REFERENCES auth.users
  entries: jsonb           -- Conversation history
  metadata: jsonb          -- UI preferences & analytics
  created_at: timestamptz
  updated_at: timestamptz
}
```

### Entry Structure
```typescript
interface YellowboxEntry {
  entries: {
    selectedQuestion: string
    conversationHistory: ConversationMessage[]
    timeOfDay: "morning" | "daytime" | "evening"
    conversationCount: number
    completedAt: string
  }
  metadata: {
    currentFont: string
    language: string
    totalMessages: number
    aiSummary?: string
    enhancedSummary?: EnhancedSummary
  }
}
```

## 🔌 API Routes

### Core Endpoints
```typescript
POST /api/yellowbox/entries          // Save diary entries
GET  /api/yellowbox/entries          // Retrieve entries with pagination  
DELETE /api/yellowbox/entries/:id    // Delete specific entries
POST /api/yellowbox/generate-quote   // AI quote generation
POST /api/yellowbox/generate-summary // AI summary generation
```

### AI Integration
```typescript
// AI conversation endpoint
POST /api/yellowbox/diary-response {
  message: string
  conversationHistory: ConversationMessage[]
  selectedQuestion: string
  timeOfDay: "morning" | "daytime" | "evening"
}
```

## 🎯 Key Technical Innovations

### Interactive Time-Switching System
- **Visual Indicators**: Three interactive dots representing different times of day
- **Dynamic Content**: Title and prompts change based on selected time mode
- **Smooth Animations**: Framer Motion powered transitions
- **Context Persistence**: Time preference saved across sessions

### Multilingual Architecture  
- **Type-Safe Translations**: Full TypeScript support for translation keys
- **Dynamic Switching**: Language changes without page reload
- **Cultural Adaptation**: Different writing prompts for different cultures
- **Browser Detection**: Automatic language selection with user override

### AI Conversation Engine
- **Context Awareness**: Maintains conversation history and context
- **Streaming Responses**: Real-time AI response rendering
- **Error Recovery**: Robust error handling with retry mechanisms
- **Multi-Provider Support**: Easy switching between AI providers

### Canvas-Based Export System
- **High-DPI Support**: Retina-ready image generation
- **Professional Templates**: 6 carefully designed quote layouts
- **Dynamic Typography**: Custom font rendering and spacing
- **Export Optimization**: Efficient PNG generation with compression

## 🚀 Recent Enhancements

### ✅ Time-Switching Indicators (v2.1)
- Restored interactive time-of-day switching functionality
- Added smooth scale animations on user interaction
- Implemented dynamic title updates based on selected time
- Enhanced visual feedback with color transitions

### ✅ Improved Internationalization (v2.0)
- Replaced hardcoded multilingual strings with proper i18n system
- Added comprehensive translation coverage for all UI elements
- Implemented type-safe translation keys with TypeScript
- Enhanced language switching with context preservation

### ✅ Context Architecture Refactoring (v1.9)
- Modular provider architecture for better separation of concerns
- Optimized re-rendering with selective context updates
- Enhanced error handling across all providers
- Improved TypeScript integration with strict typing

## 🔧 Development Tools

### Code Quality
```json
{
  "typescript": "^5.x",           // Strict type checking
  "eslint": "^9.x",              // Next.js + React rules
  "postcss": "^8.x",             // CSS processing
  "tailwindcss": "^4.x"          // Utility-first styling
}
```

### Build & Deployment
- **PNPM** - Efficient package management
- **Next.js** - Automatic code splitting and optimization
- **Vercel** - Seamless deployment with edge functions
- **PostCSS** - CSS processing and optimization

## 📈 Performance Optimizations

- **React Query** - Intelligent data caching and synchronization
- **Code Splitting** - Automatic bundle optimization
- **Image Optimization** - Next.js Image component integration
- **Lazy Loading** - Component and route-based lazy loading
- **Memory Management** - Efficient context updates and cleanups

## 🔮 Future Roadmap

### Planned Features
- [ ] **Real-time Collaboration** - Multi-user diary sharing
- [ ] **Advanced Analytics** - Personal reflection insights
- [ ] **Voice Integration** - Voice-to-text diary entries
- [ ] **Export Formats** - PDF, EPUB, and markdown export
- [ ] **Offline Support** - Service worker implementation
- [ ] **Advanced Templates** - More quote design options

### Technical Improvements
- [ ] **Testing Suite** - Unit, integration, and E2E tests
- [ ] **Performance Monitoring** - Real-time performance tracking
- [ ] **API Documentation** - OpenAPI/Swagger documentation
- [ ] **Enhanced Error Monitoring** - External error tracking
- [ ] **Advanced State Management** - Migration to Zustand for complex state

---

## 🤖 Alice AI Chatbot System

Alice is an AI-powered graduate school guidance counselor designed to help students navigate the PhD application process.

### Core Features
- **Lead Qualification** - Automated student assessment
- **Personalized Guidance** - Tailored advice based on student profiles  
- **Document Analysis** - CV/Resume parsing and feedback
- **Application Strategy** - School and advisor recommendations

### Technical Implementation
- Built on the same Next.js/TypeScript foundation
- Integrated with multiple AI providers for natural conversations
- Supabase backend for student data management
- Advanced conversation flow management

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- PNPM package manager
- Supabase account for backend services

### Environment Variables
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services  
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd ai-dashboard

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations (if needed)
# Configure Supabase schema

# Start development server
pnpm dev
```

## 🤝 Contributing

This is a research project at Stanford University. For questions or collaboration opportunities, please reach out through the appropriate academic channels.

## 📄 License

This project is part of Stanford University research activities. Please respect intellectual property and research guidelines.

---

Built with ❤️ at Stanford University | Powered by Next.js, TypeScript & Supabase