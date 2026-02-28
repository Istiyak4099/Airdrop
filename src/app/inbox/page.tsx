
"use client";

import { useState } from "react"
import { Search, Send, Paperclip, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuickReplies } from "@/components/inbox/quick-replies"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"

export default function InboxPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const effectiveUserId = user?.uid || "anonymous-user";
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);

  // Fetch all conversations
  const conversationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'userAccounts', effectiveUserId, 'conversations'),
      orderBy('lastMessageTimestamp', 'desc')
    );
  }, [firestore, effectiveUserId]);
  const { data: conversations, isLoading: loadingConvos } = useCollection(conversationsQuery);

  // Fetch messages for selected conversation
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedConvoId) return null;
    return query(
      collection(firestore, 'userAccounts', effectiveUserId, 'conversations', selectedConvoId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
  }, [firestore, effectiveUserId, selectedConvoId]);
  const { data: messages, isLoading: loadingMessages } = useCollection(messagesQuery);

  const selectedConvo = conversations?.find(c => c.id === selectedConvoId);
  const latestCustomerMessage = messages?.filter(m => m.senderType === 'user').pop()?.content || "";

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
                {loadingConvos && <p className="text-center p-4 text-sm text-muted-foreground">Loading chats...</p>}
                {!loadingConvos && conversations?.length === 0 && (
                  <p className="text-center p-8 text-sm text-muted-foreground">No conversations yet.</p>
                )}
                {conversations?.map((convo) => (
                <button
                    key={convo.id}
                    onClick={() => setSelectedConvoId(convo.id)}
                    className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent ${
                    selectedConvoId === convo.id ? "bg-accent" : ""
                    }`}
                >
                    <div className="flex w-full items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{(convo.customerName || 'C').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="font-semibold truncate">{convo.customerName || "Customer"}</div>
                        <div className="text-xs text-muted-foreground truncate">{convo.id}</div>
                    </div>
                    {convo.lastMessageTimestamp && (
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(convo.lastMessageTimestamp.toDate(), { addSuffix: true })}
                      </div>
                    )}
                    </div>
                </button>
                ))}
            </div>
            </ScrollArea>
        </div>
        <div className="flex flex-col h-[calc(100vh-5rem)]">
            {selectedConvoId ? (
              <>
                <div className="flex items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{selectedConvo?.customerName || "Customer"}</h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages?.map((message) => (
                        <div key={message.id} className={`flex items-end gap-2 ${message.senderType === 'user' ? 'justify-start' : 'justify-end'}`}>
                          {message.senderType === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>C</AvatarFallback>
                                </Avatar>
                          )}
                          <div className={`max-w-xs lg:max-w-md rounded-lg p-3 text-sm ${message.senderType === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <p>{message.content}</p>
                              {message.timestamp && (
                                <p className={`text-[10px] mt-1 ${message.senderType === 'ai' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                  {message.timestamp.toDate().toLocaleTimeString()}
                                </p>
                              )}
                          </div>
                          {message.senderType === 'ai' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>AI</AvatarFallback>
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
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a conversation to view messages</p>
              </div>
            )}
        </div>
    </div>
  )
}
