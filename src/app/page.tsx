import Link from "next/link"
import {
  ArrowUpRight,
  Bot,
  Facebook,
  Link as LinkIcon,
  MessageSquare,
  Package,
  CreditCard,
  MessageCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <Card className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/40 border-0 shadow-none">
        <div className="space-y-2 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Welcome to Airdrop</h2>
          <p className="text-muted-foreground max-w-lg">
            Help your business grow faster with AI-powered social media automation.
          </p>
          <div className="flex gap-2 pt-2">
            <Button asChild>
                <Link href="/inbox">Start Chatting</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/settings">Connect Pages</Link>
            </Button>
          </div>
        </div>
        <Bot className="w-24 h-24 text-primary/80" />
      </Card>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Total Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start chatting to see data
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Facebook className="h-4 w-4 text-muted-foreground" />
                Connected Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
                Connect your business pages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4 text-muted-foreground" />
                Auto Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Messages handled by AI
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Free</div>
            <Button asChild variant="link" className="p-0 h-auto text-xs">
                <Link href="/landing#pricing">Upgrade for more features</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            <Card className="flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">AI Chat Assistant</CardTitle>
                <CardDescription className="mb-4">Start a conversation with our AI assistant</CardDescription>
                <Button asChild>
                    <Link href="/inbox">Chat Now</Link>
                </Button>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center p-6">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Facebook className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Connect Social Media</CardTitle>
                <CardDescription className="mb-4">Integrate your social media business pages</CardDescription>
                <Button asChild>
                    <Link href="/settings">Connect</Link>
                </Button>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center p-6">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Subscription Plans</CardTitle>
                <CardDescription className="mb-4">Explore our various subscription plans</CardDescription>
                <Button asChild variant="secondary">
                    <Link href="/landing#pricing">View Plans</Link>
                </Button>
            </Card>
        </div>
      </div>
    </>
  )
}
