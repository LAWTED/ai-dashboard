import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'zh'],
  
  // Default locale
  defaultLocale: 'en',

  // Path names for different locales
  pathnames: {
    '/': '/',
    '/yellowbox': {
      en: '/yellowbox',
      zh: '/yellowbox'
    },
    '/social-journal': {
      en: '/social-journal',
      zh: '/social-journal'
    },
    '/alice': {
      en: '/alice',
      zh: '/alice'
    },
    '/games': {
      en: '/games',
      zh: '/games'
    },
    '/professor': {
      en: '/professor',
      zh: '/professor'
    },
    '/student': {
      en: '/student',
      zh: '/student'
    }
  }
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];