import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { EB_Garamond } from 'next/font/google';

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-sans',
});


export const metadata: Metadata = {
  title: 'Airdrop',
  description: 'AI Agent platform to automate customer communication.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${garamond.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
