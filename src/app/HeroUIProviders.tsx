'use client';

import { HeroUIProvider } from '@heroui/react';
import React from 'react';

export function HeroUIProviders({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
