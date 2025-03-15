"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, Info, ArrowRight } from "lucide-react"
import { MainNav } from "@/components/main-nav"

type Message = {
  id: number
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

// Sample responses for the chatbot
const botResponses = [
  {
    keywords: ["tremor", "shaking", "shake"],
    response:
      "Tremors are a common symptom of Parkinson's disease. They often start in one hand, finger, or foot, and typically occur at rest. If you're experiencing new or worsening tremors, it's important to track them in your symptom journal and discuss with your healthcare provider.",
  },
  {
    keywords: ["stiff", "stiffness", "rigid", "rigidity"],
    response:
      "Muscle stiffness or rigidity is a key symptom of Parkinson's. This can make it harder to move and may cause pain. Regular stretching, physical therapy, and proper medication can help manage this symptom. Have you been tracking your stiffness levels in the app?",
  },
  {
    keywords: ["slow", "slowness", "bradykinesia"],
    response:
      "Slowness of movement, or bradykinesia, is a cardinal symptom of Parkinson's. This might make simple tasks take longer than before. Regular exercise, especially activities that focus on big, purposeful movements, can help manage this symptom.",
  },
  {
    keywords: ["balance", "fall", "falling", "stability"],
    response:
      "Balance problems can develop as Parkinson's progresses. This might increase the risk of falls. Physical therapy, specific exercises, and assistive devices can help improve stability. It's important to make your living environment as fall-proof as possible.",
  },
  {
    keywords: ["sleep", "insomnia", "tired", "fatigue"],
    response:
      "Sleep disturbances are common in Parkinson's disease. This can include difficulty falling asleep, staying asleep, or excessive daytime sleepiness. Good sleep hygiene, regular exercise (not too close to bedtime), and discussing sleep issues with your doctor can help.",
  },
  {
    keywords: ["medication", "medicine", "drug", "treatment"],
    response:
      "Medication management is crucial for controlling Parkinson's symptoms. It's important to take medications as prescribed and at the right times. Using the medication tracker in the app can help you stay on schedule. If you're experiencing side effects or reduced effectiveness, consult with your healthcare provider.",
  },
  {
    keywords: ["exercise", "workout", "physical", "activity"],
    response:
      "Regular exercise is one of the most important things you can do to manage Parkinson's symptoms. Activities like walking, swimming, tai chi, and specific Parkinson's exercise programs can help maintain mobility, balance, and overall well-being.",
  },
  {
    keywords: ["diet", "food", "nutrition", "eat"],
    response:
      "While there's no specific diet for Parkinson's, a balanced diet rich in fruits, vegetables, whole grains, and lean protein is beneficial. Some people find that certain foods may affect their medication absorption. It's also important to stay hydrated and maintain a healthy weight.",
  },
  {
    keywords: ["depression", "anxiety", "mood", "sad", "stress"],
    response:
      "Mood changes, including depression and anxiety, are common non-motor symptoms of Parkinson's. These are not just reactions to diagnosis but can be part of the disease itself due to chemical changes in the brain. Talk to your healthcare provider about these symptoms, as they are treatable.",
  },
  {
    keywords: ["speech", "voice", "talking", "swallow"],
    response:
      "Speech and swallowing difficulties can occur in Parkinson's. Speech therapy with a focus on speaking louder (like LSVT LOUD therapy) can be very effective. A speech therapist can also help with swallowing issues. The app can remind you to do your speech exercises regularly.",
  },
]

// Default response when no keywords match
const defaultResponse =
  "I understand you have a question about your symptoms. While I can provide general information about Parkinson's disease, it's important to discuss specific concerns with your healthcare provider. Would you like to know more about common Parkinson's symptoms or management strategies?"

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hello! I'm your ParkinTrack AI Assistant. I can answer questions about Parkinson's symptoms, medication, and management strategies. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate bot typing
    setIsTyping(true)

    // Find a matching response or use default
    setTimeout(() => {
      setIsTyping(false)

      // Check for keyword matches
      const userInput = input.toLowerCase()
      const matchedResponse = botResponses.find((item) => item.keywords.some((keyword) => userInput.includes(keyword)))

      const botMessage: Message = {
        id: messages.length + 2,
        content: matchedResponse ? matchedResponse.response : defaultResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1500) // Simulate typing delay
  }

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
                  <CardTitle>Chat with ParkinTrack Assistant</CardTitle>
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
                          <Avatar className={message.sender === "user" ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}>
                            <AvatarFallback>
                              {message.sender === "user" ? <User size={18} /> : <Bot size={18} />}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg p-3 ${
                              message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
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
                              <div
                                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
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
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 ParkinTrack. All rights reserved.</p>
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

