
"use client";

import { useState } from "react"
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
  Copy,
  Plus,
  HelpCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [pageId, setPageId] = useState("");
  const [pageName, setPageName] = useState("");
  const [pageToken, setPageToken] = useState("");

  const effectiveUserId = user?.uid || "anonymous-user";

  const pagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'facebook_pages'), where('userAccountId', '==', effectiveUserId));
  }, [firestore, effectiveUserId]);
  const { data: connectedPages, isLoading: loadingPages } = useCollection(pagesQuery);

  const convosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'userAccounts', effectiveUserId, 'conversations'));
  }, [firestore, effectiveUserId]);
  const { data: conversations, isLoading: loadingConvos } = useCollection(convosQuery);

  const copyUid = () => {
    navigator.clipboard.writeText(effectiveUserId);
    toast({
      title: "Copied!",
      description: "User ID copied to clipboard.",
    });
  };

  const handleConnectPage = async () => {
    if (!pageId || !pageToken || !firestore) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const pageRef = doc(firestore, 'facebook_pages', pageId);
      await setDoc(pageRef, {
        pageId,
        pageName: pageName || "Unnamed Page",
        pageAccessToken: pageToken,
        userAccountId: effectiveUserId,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Success!",
        description: "Your Facebook Page has been connected.",
      });
      setIsConnectOpen(false);
      setPageId("");
      setPageName("");
      setPageToken("");
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded-md">
            <span>Active User ID: <code className="font-mono">{effectiveUserId}</code></span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyUid}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          
          <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Connect Page
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Connect Facebook Page</DialogTitle>
                <DialogDescription>
                  Enter your Page details from the Meta Developer Portal.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="page-id">Page ID</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px]">
                          <p>Find this in your Facebook Page "About" section or the Meta Developer Portal.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input 
                    id="page-id" 
                    placeholder="e.g. 1029384756" 
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="page-name">Page Name</Label>
                  <Input 
                    id="page-name" 
                    placeholder="My Business Page" 
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="page-token">Page Access Token</Label>
                  <Input 
                    id="page-token" 
                    type="password"
                    placeholder="EAAB..." 
                    value={pageToken}
                    onChange={(e) => setPageToken(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleConnectPage} disabled={isSubmitting}>
                  {isSubmitting ? "Connecting..." : "Save Connection"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/40 border-0 shadow-none">
        <div className="space-y-2 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Welcome to Airdrop</h2>
          <p className="text-muted-foreground max-w-lg">
            Your AI assistant is ready to handle your Facebook messages. Make sure your Page is connected using the button above.
          </p>
          <div className="flex gap-2 pt-2">
            <Button asChild>
                <Link href="/inbox">Open Inbox</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/settings">Configure AI</Link>
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
                Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {loadingConvos ? "Loading..." : "Active chat threads"}
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
            <div className="text-2xl font-bold">{connectedPages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
                {loadingPages ? "Loading..." : "Linked Facebook Pages"}
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
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">
              AI is currently active
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
                <Link href="/dashboard">View Usage Limits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {connectedPages && connectedPages.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connectedPages.map((page) => (
            <Card key={page.id} className="p-4 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Facebook className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{page.pageName}</p>
                <p className="text-xs text-muted-foreground">ID: {page.pageId}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            <Card className="flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Message History</CardTitle>
                <CardDescription className="mb-4">Review and manage recent AI conversations</CardDescription>
                <Button asChild>
                    <Link href="/inbox">View Inbox</Link>
                </Button>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center p-6">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Settings2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">AI Settings</CardTitle>
                <CardDescription className="mb-4">Tune your brand voice and knowledge base</CardDescription>
                <Button asChild>
                    <Link href="/settings">Adjust Settings</Link>
                </Button>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center p-6">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Plan Details</CardTitle>
                <CardDescription className="mb-4">Explore features available in our Pro plans</CardDescription>
                <Button asChild variant="secondary">
                    <Link href="/dashboard">Learn More</Link>
                </Button>
            </Card>
        </div>
      </div>
    </>
  )
}

function Settings2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  )
}
