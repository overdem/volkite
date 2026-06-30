import type { Metadata, Viewport } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#07283b',
};

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
