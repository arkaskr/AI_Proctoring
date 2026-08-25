import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Proctoring System - Secure Examination Environment',
  description: 'AI-powered secure online examination and proctoring platform with real-time biometric and behavioural telemetry.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-100 text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
