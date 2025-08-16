

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
import { Building, Mic, List, Settings2, Bot, Send, ChevronDown, ChevronUp, Package, HelpCircle, PlusCircle, Trash2, RotateCcw, ArrowRight } from "lucide-react"
import { Skeleton } from '@/components/ui/skeleton';
import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';
import { useToast } from '@/hooks/use-toast';
import { saveBusinessProfile, getBusinessProfile, BusinessProfile } from '@/services/business-profile-service';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThreeStateSwitch } from '@/components/ui/three-state-switch';
import { Checkbox } from '@/components/ui/checkbox';


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

type BrandVoiceState = 'left' | 'neutral' | 'right';

interface BrandVoice {
    professionalism: BrandVoiceState;
    verbosity: BrandVoiceState;
    formality: BrandVoiceState;
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
    const [activeTab, setActiveTab] = useState('business-basics');
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
        professionalism: 'neutral',
        verbosity: 'neutral',
        formality: 'neutral',
    });
    const [writingStyleExample, setWritingStyleExample] = useState('');
    const [languageHandling, setLanguageHandling] = useState('auto-detect');
    const [preferredResponseLength, setPreferredResponseLength] = useState('short');
    const [escalationProtocol, setEscalationProtocol] = useState('escalate');
    const [followUpQuestions, setFollowUpQuestions] = useState(false);
    const [proactiveSuggestions, setProactiveSuggestions] = useState(false);
    const [additionalResponseGuidelines, setAdditionalResponseGuidelines] = useState('');
    const [companyPolicies, setCompanyPolicies] = useState('');
    const [sensitiveTopicsHandling, setSensitiveTopicsHandling] = useState('');
    const [complianceRequirements, setComplianceRequirements] = useState('');
    const [additionalKnowledge, setAdditionalKnowledge] = useState('');


    useEffect(() => {
        if (user) {
            getBusinessProfile(user.uid).then(profile => {
                if (profile) {
                    setBusinessName(profile.companyName || '');
                    setIndustry(profile.industry || '');
                    setDescription(profile.description || '');
                    if (profile.products && profile.products.length > 0) {
                      setProducts(profile.products);
                    }
                    if (profile.faqs && profile.faqs.length > 0) {
                      setFaqs(profile.faqs);
                    }
                    if(profile.brandVoice) {
                        setBrandVoice(profile.brandVoice);
                    }
                    if (profile.writingStyleExample) {
                        setWritingStyleExample(profile.writingStyleExample);
                    }
                    if(profile.languageHandling) {
                        setLanguageHandling(profile.languageHandling);
                    }
                    if(profile.preferredResponseLength) {
                        setPreferredResponseLength(profile.preferredResponseLength);
                    }
                    if (profile.escalationProtocol) {
                        setEscalationProtocol(profile.escalationProtocol);
                    }
                    if (profile.followUpQuestions) {
                        setFollowUpQuestions(profile.followUpQuestions);
                    }
                    if (profile.proactiveSuggestions) {
                        setProactiveSuggestions(profile.proactiveSuggestions);
                    }
                    if(profile.additionalResponseGuidelines) {
                        setAdditionalResponseGuidelines(profile.additionalResponseGuidelines);
                    }
                    if (profile.companyPolicies) {
                        setCompanyPolicies(profile.companyPolicies);
                    }
                    if (profile.sensitiveTopicsHandling) {
                        setSensitiveTopicsHandling(profile.sensitiveTopicsHandling);
                    }
                    if (profile.complianceRequirements) {
                        setComplianceRequirements(profile.complianceRequirements);
                    }
                    if (profile.additionalKnowledge) {
                        setAdditionalKnowledge(profile.additionalKnowledge);
                    }
                }
            });
        }
    }, [user]);

    const handleSave = async (data: Partial<BusinessProfile>, successMessage: string, showToast = true) => {
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
            await saveBusinessProfile(data, user.uid);
            if (showToast) {
                toast({
                    title: "Settings Saved!",
                    description: successMessage,
                });
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
            if (showToast) {
                toast({
                    title: "Save Failed",
                    description: "Could not save your settings. Please try again.",
                    variant: "destructive"
                });
            }
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
    
    const handleBrandVoiceChange = (field: keyof BrandVoice, value: BrandVoiceState) => {
        setBrandVoice(prev => ({ ...prev, [field]: value }));
    };
    
    const handleResetBrandVoice = () => {
        setBrandVoice({
            professionalism: 'neutral',
            verbosity: 'neutral',
            formality: 'neutral',
        });
    };

    const handleSaveAndNext = async (data: Partial<BusinessProfile>, successMessage: string, nextTab: string) => {
        await handleSave(data, successMessage, false);
        setActiveTab(nextTab);
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                       <div className="flex w-full justify-between">
                            <Button 
                                onClick={() => handleSave({ companyName: businessName, industry, description }, "Your business basics have been updated.")} 
                                disabled={isSaving || !user}
                                className="bg-green-600 hover:bg-green-700">
                                {isSaving ? 'Saving...' : 'Save Business Basics'}
                            </Button>
                             <Button onClick={() => handleSaveAndNext({ companyName: businessName, industry, description }, "Your business basics have been updated.", 'products-services')}>
                                Next: Products & Services <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
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
                        <div className="flex w-full justify-between">
                            <Button 
                                onClick={() => handleSave({ products }, "Your products have been saved.")}
                                disabled={isSaving || !user}
                                className="bg-green-600 hover:bg-green-700">
                                {isSaving ? 'Saving...' : 'Save Products'}
                            </Button>
                             <Button onClick={() => handleSaveAndNext({ products }, "Your products have been saved.", 'faqs')}>
                                Next: FAQs <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
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
                         <div className="flex w-full justify-between">
                            <Button 
                                onClick={() => handleSave({ faqs }, "Your FAQs have been saved.")}
                                disabled={isSaving || !user}
                                className="bg-green-600 hover:bg-green-700">
                                {isSaving ? 'Saving...' : 'Save FAQs'}
                            </Button>
                            <Button onClick={() => handleSaveAndNext({ faqs }, "Your FAQs have been saved.", 'brand-voice')}>
                                Next: Brand Voice <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
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
                            <div className="flex items-center justify-between mb-4">
                                <Label>Tone of Voice</Label>
                                <Button variant="ghost" size="sm" onClick={handleResetBrandVoice}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <Label className="w-1/3 text-left">Professional</Label>
                                    <ThreeStateSwitch
                                        id="professionalism-switch"
                                        value={brandVoice.professionalism}
                                        onValueChange={(value) => handleBrandVoiceChange('professionalism', value)}
                                    />
                                    <Label className="w-1/3 text-right">Casual</Label>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <Label className="w-1/3 text-left">Detailed</Label>
                                    <ThreeStateSwitch
                                        id="verbosity-switch"
                                        value={brandVoice.verbosity}
                                        onValueChange={(value) => handleBrandVoiceChange('verbosity', value)}
                                    />
                                    <Label className="w-1/3 text-right">Concise</Label>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <Label className="w-1/3 text-left">Formal</Label>
                                     <ThreeStateSwitch
                                        id="formality-switch"
                                        value={brandVoice.formality}
                                        onValueChange={(value) => handleBrandVoiceChange('formality', value)}
                                    />
                                    <Label className="w-1/3 text-right">Friendly</Label>
                                </div>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="writing-style">Writing Style Examples</Label>
                            <Textarea
                                id="writing-style"
                                placeholder="Provide examples of how you would like the AI to write, e.g., 'Use short, clear sentences. Always thank the customer for their question.'"
                                value={writingStyleExample}
                                onChange={(e) => setWritingStyleExample(e.target.value)}
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Examples of your preferred communication style help the AI better match your brand voice.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full justify-between">
                            <Button 
                                onClick={() => handleSave({ brandVoice, writingStyleExample }, "Your brand voice settings have been saved.")}
                                disabled={isSaving || !user}
                                className="bg-green-600 hover:bg-green-700">
                                {isSaving ? 'Saving...' : 'Save Brand Voice'}
                            </Button>
                             <Button onClick={() => handleSaveAndNext({ brandVoice, writingStyleExample }, "Your brand voice settings have been saved.", 'response-guidelines')}>
                                Next: Response Guidelines <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                 </Card>
            </TabsContent>
            <TabsContent value="response-guidelines">
                <Card>
                    <CardHeader>
                        <CardTitle>Response Guidelines</CardTitle>
                        <CardDescription>Set rules and guidelines for how the AI should respond.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="language-handling">Language Handling</Label>
                            <Select value={languageHandling} onValueChange={setLanguageHandling}>
                                <SelectTrigger id="language-handling">
                                    <SelectValue placeholder="Select language handling" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto-detect">Auto-detect and match customer's language</SelectItem>
                                    <SelectItem value="english-only">English only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="response-length">Preferred Response Length</Label>
                            <Select value={preferredResponseLength} onValueChange={setPreferredResponseLength}>
                                <SelectTrigger id="response-length">
                                    <SelectValue placeholder="Select response length" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                                    <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
                                    <SelectItem value="long">Long (4+ sentences with details)</SelectItem>
                                    <SelectItem value="adaptive">Adaptive (matches customer's style)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="escalation-protocol">When the AI Doesn't Know an Answer:</Label>
                            <Select value={escalationProtocol} onValueChange={setEscalationProtocol}>
                                <SelectTrigger id="escalation-protocol">
                                    <SelectValue placeholder="Select an action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="escalate">Offer to escalate to a human team member</SelectItem>
                                    <SelectItem value="admit-limitations">Admit limitations and offer alternative help</SelectItem>
                                    <SelectItem value="research">Offer to research and follow up later</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Follow-up Questions</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="follow-up-questions"
                                    checked={followUpQuestions}
                                    onCheckedChange={(checked) => setFollowUpQuestions(Boolean(checked))}
                                />
                                <Label htmlFor="follow-up-questions" className="font-normal">
                                    Have the AI ask follow-up questions to better understand customer needs
                                </Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Proactive Suggestions</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="proactive-suggestions"
                                    checked={proactiveSuggestions}
                                    onCheckedChange={(checked) => setProactiveSuggestions(Boolean(checked))}
                                />
                                <Label htmlFor="proactive-suggestions" className="font-normal">
                                    Suggest relevant products or services when appropriate
                                </Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="additional-guidelines">Additional Response Guidelines</Label>
                            <Textarea
                                id="additional-guidelines"
                                placeholder="e.g., Do not make promises about future product features. Always use positive language."
                                value={additionalResponseGuidelines}
                                onChange={(e) => setAdditionalResponseGuidelines(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full justify-between">
                            <Button 
                                onClick={() => handleSave({ languageHandling, preferredResponseLength, escalationProtocol, followUpQuestions, proactiveSuggestions, additionalResponseGuidelines }, "Your response guidelines have been saved.")}
                                disabled={isSaving || !user}
                                className="bg-green-600 hover:bg-green-700">
                                {isSaving ? 'Saving...' : 'Save Guidelines'}
                            </Button>
                            <Button onClick={() => handleSaveAndNext({ languageHandling, preferredResponseLength, escalationProtocol, followUpQuestions, proactiveSuggestions, additionalResponseGuidelines }, "Your response guidelines have been saved.", 'advanced-settings')}>
                                Next: Advanced Settings <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="advanced-settings">
                <Card>
                    <CardHeader>
                        <CardTitle>Advanced Settings</CardTitle>
                        <CardDescription>Fine-tune advanced AI parameters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-policies">Company Policies</Label>
                            <Textarea
                                id="company-policies"
                                placeholder="e.g., Return policy, shipping information, privacy policy."
                                value={companyPolicies}
                                onChange={(e) => setCompanyPolicies(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sensitive-topics">Sensitive Topics Handling</Label>
                            <Textarea
                                id="sensitive-topics"
                                placeholder="e.g., How to respond to customer complaints, negative feedback, or emergencies."
                                value={sensitiveTopicsHandling}
                                onChange={(e) => setSensitiveTopicsHandling(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="compliance">Compliance Requirements</Label>
                            <Textarea
                                id="compliance"
                                placeholder="e.g., GDPR, HIPAA, or other industry-specific regulations to adhere to."
                                value={complianceRequirements}
                                onChange={(e) => setComplianceRequirements(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="additional-knowledge">Additional Knowledge</Label>
                            <Textarea
                                id="additional-knowledge"
                                placeholder="e.g., Specific terminology, jargon, or any other information the AI should know."
                                value={additionalKnowledge}
                                onChange={(e) => setAdditionalKnowledge(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => handleSave({ companyPolicies, sensitiveTopicsHandling, complianceRequirements, additionalKnowledge }, "Your advanced settings have been saved.")}
                            disabled={isSaving || !user}
                            className="bg-green-600 hover:bg-green-700">
                            {isSaving ? 'Saving...' : 'Save Advanced Settings'}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
        <AiResponsePreview />
    </div>
  )
}
