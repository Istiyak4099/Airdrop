import Image from "next/image"
import { Search, Send, Paperclip } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuickReplies } from "@/components/inbox/quick-replies"

export default function InboxPage() {
    const conversations = [
    {
      id: 1,
      name: "Alice Johnson",
      lastMessage: "Thanks for the help!",
      avatar: "https://placehold.co/100x100",
      time: "2m ago",
      platform: "Facebook",
      active: true,
    },
    {
      id: 2,
      name: "Bob Williams",
      lastMessage: "I have another question about my order.",
      avatar: "https://placehold.co/100x100",
      time: "1h ago",
      platform: "Instagram",
    },
    {
      id: 3,
      name: "Charlie Brown",
      lastMessage: "You're the best!",
      avatar: "https://placehold.co/100x100",
      time: "3h ago",
      platform: "Facebook",
    },
  ]

  const messages = [
    {
        id: 1,
        sender: 'user',
        content: 'Hi, I need help with my order #12345. It has not arrived yet.',
        timestamp: '10:30 AM',
    },
    {
        id: 2,
        sender: 'ai',
        content: "I'm sorry to hear that. Let me check the status for you. One moment please.",
        timestamp: '10:31 AM',
    },
    {
        id: 3,
        sender: 'ai',
        content: "I see that your order is currently out for delivery and should arrive by 5 PM today. You can track it here: [link]",
        timestamp: '10:32 AM',
    },
    {
        id: 4,
        sender: 'user',
        content: "Oh, great! Thanks for the quick update.",
        timestamp: '10:33 AM',
    }
  ]

  const latestCustomerMessage = messages.filter(m => m.sender === 'user').pop()?.content || "";


  return (
    <div className="grid h-full w-full grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
        <div className="flex flex-col border-r bg-muted/40">
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations" className="pl-8" />
                </div>
            </div>
            <ScrollArea className="flex-1">
            <div className="flex flex-col gap-2 p-2">
                {conversations.map((convo) => (
                <button
                    key={convo.id}
                    className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent ${
                    convo.active ? "bg-accent" : ""
                    }`}
                >
                    <div className="flex w-full items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={convo.avatar} alt={convo.name} data-ai-hint="person face" />
                        <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold">{convo.name}</div>
                        <div className="text-xs text-muted-foreground">{convo.platform}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{convo.time}</div>
                    </div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">
                        {convo.lastMessage}
                    </div>
                </button>
                ))}
            </div>
            </ScrollArea>
        </div>
        <div className="flex flex-col h-[calc(100vh-5rem)]">
            <div className="flex items-center p-4 border-b">
                <h2 className="text-xl font-semibold">Alice Johnson</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                    <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {message.sender === 'ai' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                       )}
                       <div className={`max-w-xs lg:max-w-md rounded-lg p-3 text-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                           <p>{message.content}</p>
                           <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{message.timestamp}</p>
                       </div>
                       {message.sender === 'user' && (
                            <Avatar className="h-8 w-8">
                                 <AvatarImage src="https://placehold.co/100x100" alt="User" data-ai-hint="person face" />
                                <AvatarFallback>AJ</AvatarFallback>
                            </Avatar>
                       )}
                    </div>
                    ))}
                </div>
            </ScrollArea>
             <div className="p-4 border-t bg-muted/40">
                <QuickReplies latestCustomerMessage={latestCustomerMessage} />
                <div className="relative mt-4">
                    <Textarea
                        placeholder="Type your message..."
                        className="pr-16"
                    />
                    <div className="absolute top-3 right-3 flex gap-1">
                        <Button type="submit" size="icon" className="h-8 w-8">
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                            <Paperclip className="h-4 w-4" />
                             <span className="sr-only">Attach</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
