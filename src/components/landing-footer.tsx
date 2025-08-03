import Link from 'next/link';
import { Bot, Twitter, Facebook, Instagram } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Bot className="h-7 w-7 text-primary" />
              <span>Aether Assistant</span>
            </Link>
            <p className="text-sm text-muted-foreground">AI-powered customer communication platform.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Product</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary">Login</Link></li>
              <li><Link href="/signup" className="text-muted-foreground hover:text-primary">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Aether Assistant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
