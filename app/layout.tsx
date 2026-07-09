import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Spendly',
    default: 'Spendly — Personal Finance OS',
  },
  description:
    'Manage your expenses, budgets, loans, and investments in one place. Your personal finance operating system.',
  keywords: ['personal finance', 'expense tracker', 'budget', 'investments', 'loans'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0D1B3E',
                color: '#fff',
                fontSize: '0.875rem',
                borderRadius: '10px',
                padding: '12px 16px',
                boxShadow: '0 8px 24px rgba(13,27,62,0.25)',
              },
              success: {
                iconTheme: {
                  primary: '#1A7A4A',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#C0293E',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
