import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'Flow Builder' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ height: '100vh', margin: 0 }}>{children}</body>
    </html>
  );
}
