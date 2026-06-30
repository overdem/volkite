import '../globals.css';

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
