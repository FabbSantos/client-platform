'use client';

import { ReactNode } from 'react';
import { CoinsProvider } from '../../hooks/useCoinsContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <CoinsProvider>
      {children}
    </CoinsProvider>
  );
}
