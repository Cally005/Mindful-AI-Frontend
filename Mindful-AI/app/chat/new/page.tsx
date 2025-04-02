"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send, Loader2, Tag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { TypingEffect, useTypingEffect } from "@/components/chat/typing-effect"
import { generateChatTitle, updateChatTitle } from "@/services/title-service"
import { fetchChatTopics, startTopicChat, type ChatTopic } from "@/services/topics-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

// Define API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function NewChatPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm MindfulAI, your mental health companion. How are you feeling today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [topics, setTopics] = useState<ChatTopic[]>([])
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [showTopicsDialog, setShowTopicsDialog] = useState(false)
  const [lastMessageAnimating, setLastMessageAnimating] = useState<string | null>(null)
  const { useTyping } = useTypingEffect()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Create a new chat session and fetch topics when the page loads
  useEffect(() => {
    fetchLastConversation()
    // createChatSession()
    loadChatTopics()
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, lastMessageAnimating])

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken')
    }
    return null
  }

  // Load chat topics
  const loadChatTopics = async () => {
    setIsLoadingTopics(true)
    try {
      const token = getAuthToken()
      const topicsData = await fetchChatTopics(token)
      setTopics(topicsData)
    } catch (error) {
      console.error('Error loading chat topics:', error)
    } finally {
      setIsLoadingTopics(false)
    }
  }

 
    const fetchLastConversation = async () => {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/session/last`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
  
        if (response.ok) {
          const data = await response.json()
          if (data.status && data.data.sessionId) {
            // Redirect to the last conversation or set the session
            router.push(`/chat/${data.data.sessionId}`)
            return
          }
        }
  
        // If no last conversation, create a new session
        await createChatSession()
      } catch (error) {
        console.error('Error fetching last conversation:', error)
        
      }
    }
  
   
  
  


  // Create a new chat session
  const createChatSession = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "New Conversation"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create chat session')
      }

      const data = await response.json()
      if (data.status && data.data.sessionId) {
        setSessionId(data.data.sessionId)
      }
    } catch (error) {
      console.error('Error creating chat session:', error)
      toast({
        title: "Error",
        description: "Could not start a new chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle topic selection
  const handleTopicSelect = async (topic: ChatTopic) => {
    setShowTopicsDialog(false)
    setIsLoading(true)
    
    try {
      const token = getAuthToken()
      
      // First make sure we have a session
      if (!sessionId) {
        await createChatSession()
      }
      
      // Generate a response based on the selected topic
      const topicMessage = `Let's talk about ${topic.title}. ${topic.description}`;
      
      // Add a system message showing the topic
      setMessages([
        {
          id: "welcome-topic",
          role: "assistant",
          content: topicMessage,
        }
      ])
      
      // Update the chat title based on the topic
      if (sessionId) {
        await updateChatTitle(sessionId, topic.title, token);
      }
      
    } catch (error) {
      console.error('Error selecting topic:', error)
      toast({
        title: "Error",
        description: "Could not start topic chat. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !sessionId) return

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
      
      // If this is the first user message, generate a title for the chat
      if (messages.length === 1 && messages[0].role === "assistant") {
        const title = await generateChatTitle(input, sessionId, token)
        await updateChatTitle(sessionId, title, token)
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      const messageId = Date.now() + 1
      const assistantMessage = {
        id: messageId.toString(),
        role: "assistant" as const,
        content: data.data.response,
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Set this message as animating if typing effect is enabled
      if (useTyping) {
        setLastMessageAnimating(messageId.toString())
      }
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

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4 pb-20">
          {/* Topic selection prompt */}
          {messages.length === 1 && messages[0].id === "welcome" && (
            <Card className="p-4 bg-muted/50 border-dashed border-2 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => setShowTopicsDialog(true)}>
              <div className="flex items-center gap-2 justify-center text-center p-2">
                <Tag className="h-5 w-5" />
                <span>Select a topic to get started</span>
              </div>
            </Card>
          )}
          
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
                  <div className="text-sm">
                    {useTyping && message.role === "assistant" && message.id === lastMessageAnimating ? (
                      <TypingEffect 
                        content={message.content} 
                        onComplete={() => setLastMessageAnimating(null)}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
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
            disabled={!sessionId || isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || !sessionId || isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
      
      {/* Topics Dialog */}
      <Dialog open={showTopicsDialog} onOpenChange={setShowTopicsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a topic</DialogTitle>
            <DialogDescription>
              Select a topic to start a focused conversation
            </DialogDescription>
          </DialogHeader>
          {isLoadingTopics ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="mental_health">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="mental_health">Mental Health</TabsTrigger>
                  <TabsTrigger value="wellness">Wellness</TabsTrigger>
                  <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                </TabsList>
                
                {["mental_health", "wellness", "lifestyle"].map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid gap-2">
                      {topics
                        .filter(topic => topic.category === category)
                        .sort((a, b) => a.display_order - b.display_order)
                        .map(topic => (
                          <Card 
                            key={topic.id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleTopicSelect(topic)}
                          >
                            <CardContent className="p-4">
                              <h3 className="font-medium">{topic.title}</h3>
                              <p className="text-sm text-muted-foreground">{topic.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowTopicsDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}


//working but no typing effect
// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Card } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Brain, Send, Loader2 } from "lucide-react"
// import { useToast } from "@/components/ui/use-toast"

// // Define API URL from environment or default
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// export default function NewChatPage() {
//   const router = useRouter()
//   const { toast } = useToast()
//   const [sessionId, setSessionId] = useState<string | null>(null)
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "welcome",
//       role: "assistant",
//       content: "Hi there! I'm MindfulAI, your mental health companion. How are you feeling today?",
//     },
//   ])
//   const [input, setInput] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   // Create a new chat session when the page loads
//   useEffect(() => {
//     createChatSession()
//   }, [])

//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   // Get auth token from localStorage
//   const getAuthToken = () => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('authToken')
//     }
//     return null
//   }

//   // Create a new chat session
//   const createChatSession = async () => {
//     try {
//       const token = getAuthToken()
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/session`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           title: "New Conversation"
//         })
//       })

//       if (!response.ok) {
//         throw new Error('Failed to create chat session')
//       }

//       const data = await response.json()
//       if (data.status && data.data.sessionId) {
//         setSessionId(data.data.sessionId)
//         // Optionally redirect to the chat with ID page
//         // router.push(`/chat/${data.data.sessionId}`)
//       }
//     } catch (error) {
//       console.error('Error creating chat session:', error)
//       toast({
//         title: "Error",
//         description: "Could not start a new chat. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!input.trim() || isLoading || !sessionId) return

//     const userMessage = {
//       id: Date.now().toString(),
//       role: "user" as const,
//       content: input,
//     }

//     setMessages((prev) => [...prev, userMessage])
//     setInput("")
//     setIsLoading(true)

//     try {
//       const token = getAuthToken()
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/message`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           message: input,
//           sessionId: sessionId
//         })
//       })

//       if (!response.ok) {
//         throw new Error('Failed to send message')
//       }

//       const data = await response.json()
      
//       const assistantMessage = {
//         id: (Date.now() + 1).toString(),
//         role: "assistant" as const,
//         content: data.data.response,
//       }

//       setMessages((prev) => [...prev, assistantMessage])
//     } catch (error) {
//       console.error('Error sending message:', error)

//       const errorMessage = {
//         id: (Date.now() + 1).toString(),
//         role: "assistant" as const,
//         content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
//       }

//       setMessages((prev) => [...prev, errorMessage])
      
//       toast({
//         title: "Error",
//         description: "Could not send message. Please try again.",
//         variant: "destructive",
//       })
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
//             disabled={!sessionId || isLoading}
//           />
//           <Button type="submit" size="icon" disabled={!input.trim() || !sessionId || isLoading}>
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

















//mock data
// //app/chat/new/page.tsx

// "use client"

// import type React from "react"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Card } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Brain, Send, Loader2 } from "lucide-react"
// import { generateText } from "ai"
// import { openai } from "@ai-sdk/openai"

// export default function NewChatPage() {
//   const router = useRouter()
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "welcome",
//       role: "assistant",
//       content: "Hi there! I'm MindfulAI, your mental health companion. How are you feeling today?",
//     },
//   ])
//   const [input, setInput] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)

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

