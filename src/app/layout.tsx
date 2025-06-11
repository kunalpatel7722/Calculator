import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Inter } from 'next/font/google';
import DynamicChatbotButtonWrapper from '@/components/shared/DynamicChatbotButtonWrapper';
import FirebasePerformanceInitializer from '@/components/firebase/FirebasePerformanceInitializer'; // Added import

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'InvestAI - AI-Powered Investment Calculators',
  description: 'Comprehensive investment calculators for stocks, crypto, and more, powered by AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head />
      <body className="font-body flex flex-col min-h-screen">
        <FirebasePerformanceInitializer /> {/* Added component */}
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <DynamicChatbotButtonWrapper />
        <Toaster />
      </body>
    </html>
  );
}
