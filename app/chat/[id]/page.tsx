//chat/[id]/page.tsx


"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Define API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken')
    }
    return null
  }

  // Fetch chat history when the component mounts
  useEffect(() => {
    if (id) {
      fetchChatHistory(id as string)
    }
  }, [id])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch chat history from the API
  const fetchChatHistory = async (sessionId: string) => {
    setIsLoadingHistory(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/session/${sessionId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch chat history')
      }

      const data = await response.json()
      
      if (data.status && data.data.messages) {
        // Transform the data structure from the API to match our frontend format
        const formattedMessages: Message[] = []
        
        data.data.messages.forEach((msg: { user: string; ai: string }, index: number) => {
          if (msg.user) {
            formattedMessages.push({
              id: `history-user-${index}`,
              role: "user",
              content: msg.user
            })
          }
          
          if (msg.ai) {
            formattedMessages.push({
              id: `history-ai-${index}`,
              role: "assistant",
              content: msg.ai
            })
          }
        })
        
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
      toast({
        title: "Error",
        description: "Could not load chat history. Please try again.",
        variant: "destructive",
      })
      
      // Add a default welcome message if we can't load history
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Welcome back. How can I help you today?",
      }])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          sessionId: id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: data.data.response,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
      }

      setMessages((prev) => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-57px)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4 pb-20">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`p-4 ${
                message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
              }`}
            >
              <div className="flex items-start gap-3">
                {message.role === "assistant" ? (
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="MindfulAI" />
                    <AvatarFallback>
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{message.role === "assistant" ? "MindfulAI" : "You"}</p>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            </Card>
          ))}
          {isLoading && (
            <Card className="p-4 bg-muted mr-12">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="MindfulAI" />
                  <AvatarFallback>
                    <Brain className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-12 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

















// //app/chat[id]/page.tsx

// "use client"

// import type React from "react"

// import { useState, useRef, useEffect } from "react"
// import { useParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Card } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Brain, Send, Loader2 } from "lucide-react"
// import { generateText } from "ai"
// import { openai } from "@ai-sdk/openai"

// // Mock data for chat history
// const chatHistories: Record<string, Message[]> = {
//   "1": [
//     {
//       id: "1-1",
//       role: "assistant",
//       content: "Welcome back. How has your anxiety been today?",
//     },
//     {
//       id: "1-2",
//       role: "user",
//       content: "I've been feeling quite anxious about an upcoming presentation.",
//     },
//     {
//       id: "1-3",
//       role: "assistant",
//       content:
//         "That's understandable. Presentations can be stressful. Would you like to explore some techniques to manage presentation anxiety?",
//     },
//   ],
//   "2": [
//     {
//       id: "2-1",
//       role: "assistant",
//       content: "Welcome back. How has your sleep been lately?",
//     },
//     {
//       id: "2-2",
//       role: "user",
//       content: "I've been having trouble falling asleep. My mind keeps racing at night.",
//     },
//     {
//       id: "2-3",
//       role: "assistant",
//       content:
//         "I understand how frustrating that can be. Let's talk about some relaxation techniques that might help quiet your mind before bedtime.",
//     },
//   ],
//   "3": [
//     {
//       id: "3-1",
//       role: "assistant",
//       content: "Welcome back. How are you managing your stress today?",
//     },
//     {
//       id: "3-2",
//       role: "user",
//       content: "Work has been overwhelming lately. I feel like I can't keep up.",
//     },
//     {
//       id: "3-3",
//       role: "assistant",
//       content:
//         "That sounds really challenging. Let's break this down and look at some strategies to help you manage your workload and stress.",
//     },
//   ],
//   "4": [
//     {
//       id: "4-1",
//       role: "assistant",
//       content:
//         "Welcome back to our mindfulness practice. How have you been incorporating mindfulness into your daily routine?",
//     },
//     {
//       id: "4-2",
//       role: "user",
//       content: "I tried the breathing exercise you suggested, but I found it hard to stay focused.",
//     },
//     {
//       id: "4-3",
//       role: "assistant",
//       content:
//         "That's a common experience when starting mindfulness practice. Let's explore some ways to make it easier to maintain focus during your practice.",
//     },
//   ],
//   "5": [
//     {
//       id: "5-1",
//       role: "assistant",
//       content: "Welcome back. Last time we discussed work-life balance. How has that been going?",
//     },
//     {
//       id: "5-2",
//       role: "user",
//       content: "I've been trying to set boundaries, but I still find myself checking work emails at night.",
//     },
//     {
//       id: "5-3",
//       role: "assistant",
//       content:
//         "Setting boundaries takes practice. Let's talk about some specific strategies that might help you disconnect from work during your personal time.",
//     },
//   ],
// }

// export default function ChatPage() {
//   const { id } = useParams<{ id: string }>()
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   // Load chat history based on ID
//   useEffect(() => {
//     if (id && chatHistories[id]) {
//       setMessages(chatHistories[id])
//     }
//   }, [id])

//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!input.trim() || isLoading) return

//     const userMessage = {
//       id: Date.now().toString(),
//       role: "user" as const,
//       content: input,
//     }

//     setMessages((prev) => [...prev, userMessage])
//     setInput("")
//     setIsLoading(true)

//     try {
//       // Use AI SDK to generate response
//       const { text } = await generateText({
//         model: openai("gpt-4o"),
//         prompt: `You are MindfulAI, a compassionate mental health assistant. The user says: ${input}`,
//         system:
//           "You are MindfulAI, a compassionate mental health assistant. Respond with empathy and helpful advice. Keep responses concise and supportive. Never claim to be a replacement for professional mental health care. If someone is in crisis, suggest professional help or emergency services.",
//       })

//       const assistantMessage = {
//         id: (Date.now() + 1).toString(),
//         role: "assistant" as const,
//         content: text,
//       }

//       setMessages((prev) => [...prev, assistantMessage])
//     } catch (error) {
//       console.error("Error generating response:", error)

//       const errorMessage = {
//         id: (Date.now() + 1).toString(),
//         role: "assistant" as const,
//         content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
//       }

//       setMessages((prev) => [...prev, errorMessage])
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="flex flex-col h-[calc(100vh-57px)]">
//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="max-w-3xl mx-auto space-y-4 pb-20">
//           {messages.map((message) => (
//             <Card
//               key={message.id}
//               className={`p-4 ${
//                 message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
//               }`}
//             >
//               <div className="flex items-start gap-3">
//                 {message.role === "assistant" ? (
//                   <Avatar className="h-8 w-8 mt-0.5">
//                     <AvatarImage src="/placeholder.svg?height=32&width=32" alt="MindfulAI" />
//                     <AvatarFallback>
//                       <Brain className="h-4 w-4" />
//                     </AvatarFallback>
//                   </Avatar>
//                 ) : (
//                   <Avatar className="h-8 w-8 mt-0.5">
//                     <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
//                     <AvatarFallback>U</AvatarFallback>
//                   </Avatar>
//                 )}
//                 <div className="flex-1">
//                   <p className="text-sm font-medium mb-1">{message.role === "assistant" ? "MindfulAI" : "You"}</p>
//                   <div className="text-sm whitespace-pre-wrap">{message.content}</div>
//                 </div>
//               </div>
//             </Card>
//           ))}
//           {isLoading && (
//             <Card className="p-4 bg-muted mr-12">
//               <div className="flex items-start gap-3">
//                 <Avatar className="h-8 w-8 mt-0.5">
//                   <AvatarImage src="/placeholder.svg?height=32&width=32" alt="MindfulAI" />
//                   <AvatarFallback>
//                     <Brain className="h-4 w-4" />
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="flex items-center">
//                   <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                   <p className="text-sm">Thinking...</p>
//                 </div>
//               </div>
//             </Card>
//           )}
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       <div className="sticky bottom-0 bg-background border-t p-4">
//         <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
//           <Textarea
//             placeholder="Type your message..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="min-h-12 resize-none"
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault()
//                 handleSubmit(e)
//               }
//             }}
//           />
//           <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
//             <Send className="h-4 w-4" />
//             <span className="sr-only">Send message</span>
//           </Button>
//         </form>
//       </div>
//     </div>
//   )
// }

// interface Message {
//   id: string
//   role: "user" | "assistant"
//   content: string
// }

