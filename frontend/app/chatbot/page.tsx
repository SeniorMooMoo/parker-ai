"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, Info, ArrowRight } from "lucide-react";
import { MainNav } from "@/components/main-nav";

type Message = {
  id: number;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hello! I'm your Parker AI Assistant. I can answer questions about Parkinson's symptoms, medication, and management strategies. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!input.trim()) return;
  
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
  
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`, // Use environment variable
        },
        body: JSON.stringify({
          model: "sonar-pro",
          max_tokens: 133,
          messages: [
            { role: "system", content: "You are an AI assistant specializing in Parkinson's disease. Provide concise, accurate answers about symptoms, treatments, and management strategies. If a user talks to you about anything that's not parkinson's related, say that you can only give information about parkinson's. Keep the responses under 100 words." },
            { role: "user", content: input },
          ],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      const botMessage: Message = {
        id: messages.length + 2,
        content:
          data.choices[0]?.message?.content || "Sorry, I couldn't understand your query.",
        sender: "bot",
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
  
      const botMessage: Message = {
        id: messages.length + 2,
        content:
          "There was an error processing your request. Please check your API key or try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MainNav />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Symptom Assistant</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Ask questions about your symptoms, medication, or Parkinson's management
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Chat with Parker Assistant</CardTitle>
                  <CardDescription>Ask questions about symptoms, treatments, or daily management</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <Avatar
                            className={message.sender === "user" ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}
                          >
                            <AvatarFallback>
                              {message.sender === "user" ? <User size={18} /> : <Bot size={18} />}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg p-3 ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                          <Avatar className="bg-gray-200 dark:bg-gray-700">
                            <AvatarFallback>
                              <Bot size={18} />
                            </AvatarFallback>
                          </Avatar>
                          <div className="rounded-lg p-3 bg-muted">
                            <div className="flex gap-1">
                              {[0, 150, 300].map((delay) => (
                                <div
                                  key={delay}
                                  style={{ animationDelay: `${delay}ms` }}
                                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                    <Input
                      placeholder="Type your question here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </div>


            <div>
              <Card className="h-[600px] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Suggested Topics</CardTitle>
                  <CardDescription>Common questions about Parkinson's symptoms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md bg-purple-50 dark:bg-purple-900/20 p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">About This Assistant</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            This AI assistant provides general information about Parkinson's disease. It is not a
                            substitute for professional medical advice, diagnosis, or treatment.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Try asking about:</h3>
                      <SuggestedQuestion question="What causes tremors in Parkinson's?" setInput={setInput} />
                      <SuggestedQuestion question="How can I manage muscle stiffness?" setInput={setInput} />
                      <SuggestedQuestion question="What exercises are good for balance?" setInput={setInput} />
                      <SuggestedQuestion question="How does Parkinson's affect sleep?" setInput={setInput} />
                      <SuggestedQuestion question="Tips for medication management" setInput={setInput} />
                      <SuggestedQuestion question="How to track symptom progression" setInput={setInput} />
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Need more help?</h3>
                      <Link href="/resources">
                        <Button variant="outline" className="w-full">
                          Browse Resources
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Parker. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

function SuggestedQuestion({ question, setInput }: { question: string; setInput: (value: string) => void }) {
  return (
    <button
      className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
      onClick={() => setInput(question)}
    >
      {question}
    </button>
  )
}

