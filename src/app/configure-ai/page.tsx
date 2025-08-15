
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
import { Textarea } from "@/components/ui/textarea"
import { Building, Mic, List, Settings2, Bot, Send, ChevronDown, ChevronUp, Package, HelpCircle, PlusCircle, Trash2 } from "lucide-react"
import { Skeleton } from '@/components/ui/skeleton';
import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';
import { useToast } from '@/hooks/use-toast';
import { saveBusinessProfile, getBusinessProfile, BusinessProfile } from '@/services/business-profile-service';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';


interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string | React.ReactNode;
}

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface BrandVoice {
    professionalism: number[];
    verbosity: number[];
    formality: number[];
    humor: number[];
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
    const [businessName, setBusinessName] = useState('');
    const [industry, setIndustry] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([
        { id: Date.now(), name: '', price: '', description: '' },
    ]);
    const [faqs, setFaqs] = useState<FAQ[]>([
        { id: Date.now(), question: '', answer: '' },
    ]);
    const [brandVoice, setBrandVoice] = useState<BrandVoice>({
        professionalism: [50],
        verbosity: [50],
        formality: [50],
        humor: [50],
    });


    useEffect(() => {
        if (user) {
            getBusinessProfile(user.uid).then(profile => {
                if (profile) {
                    setBusinessName(profile.companyName);
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
            await saveBusinessProfile({ companyName: businessName, industry, description }, user.uid);
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

    const addProduct = () => {
        setProducts(prev => [...prev, { id: Date.now(), name: '', price: '', description: '' }]);
    };

    const removeProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleProductChange = (id: number, field: keyof Omit<Product, 'id'>, value: string) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };
    
    const addFaq = () => {
        setFaqs(prev => [...prev, { id: Date.now(), question: '', answer: '' }]);
    };

    const removeFaq = (id: number) => {
        setFaqs(prev => prev.filter(faq => faq.id !== id));
    };

    const handleFaqChange = (id: number, field: keyof Omit<FAQ, 'id'>, value: string) => {
        setFaqs(prev => prev.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
    };
    
    const handleBrandVoiceChange = (field: keyof BrandVoice, value: number[]) => {
        setBrandVoice(prev => ({ ...prev, [field]: value }));
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
        <Tabs defaultValue="business-basics" className="space-y-4">
            <TabsList className="flex-col md:flex-row h-auto md:h-10">
                <TabsTrigger value="business-basics" className="w-full justify-start md:justify-center">
                    <Building className="mr-2 h-5 w-5 text-blue-500" />
                    Business Basics
                </TabsTrigger>
                <TabsTrigger value="products-services" className="w-full justify-start md:justify-center">
                    <Package className="mr-2 h-5 w-5 text-orange-500" />
                    Products & Services
                </TabsTrigger>
                <TabsTrigger value="faqs" className="w-full justify-start md:justify-center">
                    <HelpCircle className="mr-2 h-5 w-5 text-green-500" />
                    FAQs
                </TabsTrigger>
                <TabsTrigger value="brand-voice" className="w-full justify-start md:justify-center">
                    <Mic className="mr-2 h-5 w-5 text-purple-500" />
                    Brand Voice
                </TabsTrigger>
                <TabsTrigger value="response-guidelines" className="w-full justify-start md:justify-center">
                    <List className="mr-2 h-5 w-5 text-red-500" />
                    Response Guidelines
                </TabsTrigger>
                <TabsTrigger value="advanced-settings" className="w-full justify-start md:justify-center">
                     <Settings2 className="mr-2 h-5 w-5 text-gray-500" />
                    Advanced Settings
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
                            <Label htmlFor="business-name">Business Name</Label>
                            <Input 
                                id="business-name" 
                                placeholder="e.g., Aether Assistant" 
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Select value={industry} onValueChange={setIndustry}>
                                <SelectTrigger id="industry">
                                    <SelectValue placeholder="Select an industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="technology">Technology</SelectItem>
                                    <SelectItem value="e-commerce">E-commerce</SelectItem>
                                    <SelectItem value="health">Health & Wellness</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="hospitality">Hospitality</SelectItem>
                                    <SelectItem value="retail">Retail</SelectItem>
                                    <SelectItem value="real-estate">Real Estate</SelectItem>
                                    <SelectItem value="automotive">Automotive</SelectItem>
                                    <SelectItem value="consulting">Consulting</SelectItem>
                                    <SelectItem value="construction">Construction</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                    <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                    <SelectItem value="non-profit">Non-Profit</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <CardDescription>
                            Add details about the products and services you offer. This will help the AI provide more accurate responses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {products.map((product, index) => (
                            <div key={product.id} className="p-4 border rounded-lg space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto] gap-4 items-center">
                                    <div className="space-y-1">
                                        <Label htmlFor={`product-name-${product.id}`}>Product Name</Label>
                                        <Input
                                            id={`product-name-${product.id}`}
                                            value={product.name}
                                            onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                                            placeholder="e.g., AI Assistant Pro"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`price-${product.id}`}>Price</Label>
                                        <Input
                                            id={`price-${product.id}`}
                                            value={product.price}
                                            onChange={(e) => handleProductChange(product.id, 'price', e.target.value)}
                                            placeholder="e.g., $99/mo"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`product-desc-${product.id}`}>Brief Description</Label>
                                        <Input
                                            id={`product-desc-${product.id}`}
                                            value={product.description}
                                            onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                                            placeholder="e.g., Advanced AI features"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeProduct(product.id)}
                                        className="self-end"
                                        aria-label="Remove product"
                                    >
                                        <Trash2 className="h-5 w-5 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button onClick={addProduct} variant="outline" className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Product/Service
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <Button disabled={isSaving || !user}>{isSaving ? 'Saving...' : 'Save Products'}</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="faqs">
                 <Card>
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                        <CardDescription>Add frequently asked questions and their answers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="p-4 border rounded-lg space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-center">
                                    <div className="space-y-1">
                                        <Label htmlFor={`faq-question-${faq.id}`}>Question</Label>
                                        <Input
                                            id={`faq-question-${faq.id}`}
                                            value={faq.question}
                                            onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)}
                                            placeholder="e.g., What is your return policy?"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`faq-answer-${faq.id}`}>Answer</Label>
                                        <Input
                                            id={`faq-answer-${faq.id}`}
                                            value={faq.answer}
                                            onChange={(e) => handleFaqChange(faq.id, 'answer', e.target.value)}
                                            placeholder="e.g., We accept returns within 30 days."
                                        />
                                    </div>
                                     <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFaq(faq.id)}
                                        className="self-end"
                                        aria-label="Remove FAQ"
                                    >
                                        <Trash2 className="h-5 w-5 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                         <Button onClick={addFaq} variant="outline" className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add FAQ
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <Button disabled={isSaving || !user}>{isSaving ? 'Saving...' : 'Save FAQs'}</Button>
                    </CardFooter>
                 </Card>
            </TabsContent>
            <TabsContent value="brand-voice">
                 <Card>
                    <CardHeader>
                        <CardTitle>Brand Voice</CardTitle>
                        <CardDescription>Define how your AI should sound and communicate with customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-4">
                        <div>
                            <Label className="mb-4 block">Tone of Voice</Label>
                            <div className="space-y-6">
                                <div className="grid grid-cols-[100px_1fr_100px] items-center gap-4">
                                    <span className="text-sm text-muted-foreground text-right">Professional</span>
                                    <Slider value={brandVoice.professionalism} onValueChange={(value) => handleBrandVoiceChange('professionalism', value)} />
                                    <span className="text-sm text-muted-foreground">Casual</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr_100px] items-center gap-4">
                                    <span className="text-sm text-muted-foreground text-right">Detailed</span>
                                    <Slider value={brandVoice.verbosity} onValueChange={(value) => handleBrandVoiceChange('verbosity', value)} />
                                    <span className="text-sm text-muted-foreground">Concise</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr_100px] items-center gap-4">
                                    <span className="text-sm text-muted-foreground text-right">Formal</span>
                                    <Slider value={brandVoice.formality} onValueChange={(value) => handleBrandVoiceChange('formality', value)} />
                                    <span className="text-sm text-muted-foreground">Friendly</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr_100px] items-center gap-4">
                                    <span className="text-sm text-muted-foreground text-right">Serious</span>
                                    <Slider value={brandVoice.humor} onValue-change={(value) => handleBrandVoiceChange('humor', value)} />
                                    <span className="text-sm text-muted-foreground">Humorous</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button disabled={isSaving || !user}>{isSaving ? 'Saving...' : 'Save Brand Voice'}</Button>
                    </CardFooter>
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

    