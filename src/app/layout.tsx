import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Roboto } from 'next/font/google';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { FirebaseClientProvider } from '@/firebase';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700']
});

export const metadata = {
  title: 'Airdrop',
  description: 'AI Agent platform to automate customer communication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${roboto.variable}`}>
        <FirebaseClientProvider>
          <AuthProvider>
              <ProtectedRoute>
                  {children}
              </ProtectedRoute>
          </AuthProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  )
}
