
"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Building, Mic, List, Settings2, Bot, Send, ChevronDown, ChevronUp, Package, HelpCircle } from "lucide-react"
import { Skeleton } from '@/components/ui/skeleton';
import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';
import { useToast } from '@/hooks/use-toast';
import { saveBusinessProfile, getBusinessProfile, BusinessProfile } from '@/services/business-profile-service';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string | React.ReactNode;
}

function AiResponsePreview() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', content: 'Hi! How can I help you test my responses today?' },
  ]);
  const [isPending, startTransition] = useTransition();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = { id: Date.now(), sender: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    
    startTransition(async () => {
        const aiMessageContent = (
            <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
            </div>
        );
        const aiMessage: Message = { id: Date.now() + 1, sender: 'ai', content: aiMessageContent };
        setMessages(prev => [...prev, aiMessage]);

        try {
            const { welcomeMessage } = await generateWelcomeMessage({ 
                customerName: 'Test User',
                socialMediaPlatform: 'Preview Chat',
                userMessage: currentInput,
                userId: user.uid
            });

            const finalAiMessage: Message = { id: Date.now() + 1, sender: 'ai', content: welcomeMessage };
            setMessages(prev => [...prev.slice(0, -1), finalAiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { id: Date.now() + 1, sender: 'ai', content: "Sorry, I couldn't generate a response." };
            setMessages(prev => [...prev.slice(0, -1), errorMessage]);
        }
    });
  };

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/3 md:right-8 md:bottom-0 z-20">
      <Card className="rounded-t-lg shadow-2xl">
        <CardHeader onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg">AI Response Preview</CardTitle>
          </div>
          {isOpen ? <ChevronDown className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
        </CardHeader>
        {isOpen && (
          <>
            <CardContent className="p-4 h-64 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.sender === 'ai' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`max-w-xs lg:max-w-md rounded-lg p-3 text-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
                    </div>
                    {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="relative w-full">
                <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Test your AI..." 
                    className="pr-12" 
                    disabled={isPending || !user}
                />
                <Button type="submit" size="icon" className="absolute top-1/2 right-1.5 transform -translate-y-1/2 h-7 w-7" disabled={isPending || !user}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

function Avatar({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`flex items-center justify-center rounded-full bg-primary/20 text-primary ${className}`}>
            {children}
        </div>
    );
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
    return <span className="text-sm font-semibold">{children}</span>
}


export default function ConfigureAiPage() {
    const { toast } = useToast();
    const { user, loading } = useAuth();
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            getBusinessProfile(user.uid).then(profile => {
                if (profile) {
                    setCompanyName(profile.companyName);
                    setIndustry(profile.industry);
                    setDescription(profile.description);
                }
            });
        }
    }, [user]);

    const handleSaveChanges = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to save changes.",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            await saveBusinessProfile({ companyName, industry, description }, user.uid);
            toast({
                title: "Settings Saved!",
                description: "Your business basics have been updated.",
            });
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast({
                title: "Save Failed",
                description: "Could not save your business profile. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 pb-24">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

  return (
    <div className="space-y-6 pb-24">
        <div>
            <h1 className="text-2xl font-bold md:text-3xl">Configure Your AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
                Customize how your AI responds to customers across all platforms.
            </p>
        </div>
        <Tabs defaultValue="business-basics" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
                <TabsTrigger value="business-basics" className="flex items-center gap-2">
                    <Building className="h-4 w-4" /> Business Basics
                </TabsTrigger>
                <TabsTrigger value="products-services" className="flex items-center gap-2">
                    <Package className="h-4 w-4" /> Products & Services
                </TabsTrigger>
                <TabsTrigger value="faqs" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" /> FAQs
                </TabsTrigger>
                <TabsTrigger value="brand-voice" className="flex items-center gap-2">
                    <Mic className="h-4 w-4" /> Brand Voice
                </TabsTrigger>
                <TabsTrigger value="response-guidelines" className="flex items-center gap-2">
                    <List className="h-4 w-4" /> Response Guidelines
                </TabsTrigger>
                <TabsTrigger value="advanced-settings" className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" /> Advanced Settings
                </TabsTrigger>
            </TabsList>
            <TabsContent value="business-basics">
                <Card>
                <CardHeader>
                    <CardTitle>Business Basics</CardTitle>
                    <CardDescription>
                    Let's start with some basic information about your business.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input 
                            id="company-name" 
                            placeholder="e.g., Airdrop Inc." 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input 
                            id="industry" 
                            placeholder="e.g., E-commerce, Technology" 
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea 
                            id="description" 
                            placeholder="Describe what your company does, its mission, and values."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveChanges} disabled={isSaving || !user}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                </CardFooter>
                </Card>
            </TabsContent>
             <TabsContent value="products-services">
                 <Card>
                    <CardHeader>
                        <CardTitle>Products & Services</CardTitle>
                        <CardDescription>Add details about the products and services you offer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Configure your products and services here.</p>
                    </CardContent>
                 </Card>
            </TabsContent>
            <TabsContent value="faqs">
                 <Card>
                    <CardHeader>
                        <CardTitle>FAQs</CardTitle>
                        <CardDescription>Add frequently asked questions and their answers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Configure your FAQs here.</p>
                    </CardContent>
                 </Card>
            </TabsContent>
            <TabsContent value="brand-voice">
                 <Card>
                    <CardHeader>
                        <CardTitle>Brand Voice</CardTitle>
                        <CardDescription>Define the personality of your AI assistant.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Configure your AI's brand voice here.</p>
                    </CardContent>
                 </Card>
            </TabsContent>
            <TabsContent value="response-guidelines">
                 <Card>
                    <CardHeader>
                        <CardTitle>Response Guidelines</CardTitle>
                        <CardDescription>Set rules and guidelines for how the AI should respond.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Set up response guidelines here.</p>
                    </CardContent>
                 </Card>
            </TabsContent>
            <TabsContent value="advanced-settings">
                 <Card>
                    <CardHeader>
                        <CardTitle>Advanced Settings</CardTitle>
                        <CardDescription>Fine-tune advanced AI parameters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p>Configure advanced settings here.</p>
                    </CardContent>
                 </Card>
            </TabsContent>
        </Tabs>
        <AiResponsePreview />
    </div>
  )
}
