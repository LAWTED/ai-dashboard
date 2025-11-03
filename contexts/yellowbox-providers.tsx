"use client";

import React, { ReactNode } from 'react';
import { YellowBoxAuthProvider } from './yellowbox-auth-context';
import { YellowBoxUIProvider } from './yellowbox-ui-context';
import { YellowBoxI18nProvider } from './yellowbox-i18n-context';
import { YellowBoxPromptProvider } from './yellowbox-prompt-context';

interface YellowBoxProvidersProps {
  children: ReactNode;
}

export function YellowBoxProviders({ children }: YellowBoxProvidersProps) {
  return (
    <YellowBoxI18nProvider>
      <YellowBoxAuthProvider>
        <YellowBoxUIProvider>
          <YellowBoxPromptProvider>
            {children}
          </YellowBoxPromptProvider>
        </YellowBoxUIProvider>
      </YellowBoxAuthProvider>
    </YellowBoxI18nProvider>
  );
}