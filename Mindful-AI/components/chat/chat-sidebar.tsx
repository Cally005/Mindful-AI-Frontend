"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/chat/sidebar-provider"
import { 
  Brain, 
  Plus, 
  MessageCircle, 
  Settings, 
  Menu, 
  X, 
  Loader2, 
  Trash2,
  Tag
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTypingEffect } from "@/components/chat/typing-effect"
import { fetchChatTopics, type ChatTopic } from "@/services/topics-service"

// Define API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  last_message_at: string;
}

export function ChatSidebar() {
  const { open, setOpen, isMobile } = useSidebar()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [topics, setTopics] = useState<ChatTopic[]>([])
  const [showTopics, setShowTopics] = useState(false)
  const { useTyping, toggleTypingEffect } = useTypingEffect()

  // Fetch chat sessions on component mount or when triggered
  useEffect(() => {
    fetchChatSessions()
    loadChatTopics()
  }, [refreshTrigger])

  // Refresh sessions when pathname changes (i.e., navigating between chats)
  useEffect(() => {
    fetchChatSessions()
  }, [pathname])

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken')
    }
    return null
  }

  // Load chat topics
  const loadChatTopics = async () => {
    try {
      const token = getAuthToken()
      const topicsData = await fetchChatTopics(token)
      setTopics(topicsData)
    } catch (error) {
      console.error('Error loading chat topics:', error)
    }
  }

  // Fetch chat sessions from the API
  const fetchChatSessions = async () => {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions')
      }

      const data = await response.json()
      
      if (data.status && data.data.sessions) {
        setSessions(data.data.sessions)
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error)
      toast({
        title: "Error",
        description: "Could not load your conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  //create a new chat session
  const createNewConversation = async () => {
    try {
      const token = localStorage.getItem('authToken')
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

      if (response.ok) {
        const data = await response.json()
        if (data.status && data.data.sessionId) {
          // Refresh sessions list
          await fetchChatSessions()
          
          // Navigate to the new conversation
          router.push(`/chat/${data.data.sessionId}`)
        }
      }
    } catch (error) {
      console.error('Error creating new conversation:', error)
      toast({
        title: "Error",
        description: "Could not start a new chat. Please try again.",
        variant: "destructive"
      })
    }
  }


  // Delete a chat session
  const deleteSession = async () => {
    if (!deleteSessionId) return

    try {
      const token = getAuthToken()
      
      // First attempt to delete from the database
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/session/${deleteSessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Even if the API call fails, remove from local state to give immediate feedback
      setSessions(sessions.filter(session => session.id !== deleteSessionId))
      
      // If we're currently viewing this session, redirect to new chat
      if (pathname === `/chat/${deleteSessionId}`) {
        router.push('/chat/new')
      }

      if (!response.ok) {
        throw new Error('Failed to delete chat session from database')
      }

      toast({
        title: "Success",
        description: "Conversation deleted successfully.",
      })

      // Refresh the sessions list
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error deleting chat session:', error)
      
      // Add the session back to the local state if the API call failed
      fetchChatSessions()
      
      toast({
        title: "Warning",
        description: "The conversation was removed from your view, but there was an error deleting it from the database.",
        variant: "destructive",
      })
    } finally {
      setDeleteSessionId(null)
      setShowDeleteDialog(false)
    }
  }

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteSessionId(sessionId)
    setShowDeleteDialog(true)
  }
  

  
  // Start a chat with a topic
  const handleTopicClick = async (topic: ChatTopic) => {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: topic.title
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start topic chat')
      }

      const data = await response.json()
      
      if (data.status && data.data?.sessionId) {
        // Refresh the sessions list
        setRefreshTrigger(prev => prev + 1)
        
        // Navigate to the new session
        router.push(`/chat/${data.data.sessionId}`)
        
        // Close mobile sidebar if open
        if (isMobile) {
          setOpen(false)
        }
      }
    } catch (error) {
      console.error('Error starting topic chat:', error)
      toast({
        title: "Error",
        description: "Could not start a new topic chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format the chat title for display
  const formatChatTitle = (title: string): string => {
    if (!title) return "New Conversation"
    
    // If it's a timestamp-based title, make it more user-friendly
    if (title.match(/Chat \d{1,2}\/\d{1,2}\/\d{4}/)) {
      return "Conversation " + title.replace("Chat ", "")
    }
    
    return title.length > 25 ? title.substring(0, 25) + "..." : title
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-30 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r bg-muted/40 transition-transform duration-300 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold">MindfulAI</span>
          </Link>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <Button onClick={createNewConversation} className="justify-start gap-2">         
              <Plus className="h-4 w-4" />
              New conversation
           
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start gap-2"
            onClick={() => setShowTopics(!showTopics)}
          >
            <Tag className="h-4 w-4" />
            {showTopics ? "Hide topics" : "Show topics"}
          </Button>
        </div>

        {/* Topics section */}
        {showTopics && (
          <div className="px-4 py-2">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Topics</h3>
            <div className="grid grid-cols-2 gap-2">
              {topics.length > 0 ? (
                topics.map(topic => (
                  <Button 
                    key={topic.id} 
                    variant="outline" 
                    size="sm" 
                    className="justify-start h-auto py-2 text-xs"
                    onClick={() => handleTopicClick(topic)}
                  >
                    {topic.title}
                  </Button>
                ))
              ) : (
                <div className="col-span-2 text-xs text-center text-muted-foreground py-2">
                  No topics available
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        <ScrollArea className="flex-1 px-4 py-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Recent conversations</p>
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    className={`flex-1 justify-start gap-2 text-left ${
                      pathname === `/chat/${session.id}` ? 'bg-muted' : ''
                    }`}
                    asChild
                    onClick={() => isMobile && setOpen(false)}
                  >
                    <Link href={`/chat/${session.id}`}>
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span className="truncate">{formatChatTitle(session.title)}</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-60 hover:opacity-100"
                    onClick={(e) => handleDeleteClick(e, session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageCircle className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => router.push('/chat/new')}
              >
                Start your first conversation
              </Button>
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                id="typing-effect" 
                checked={useTyping} 
                onCheckedChange={toggleTypingEffect}
              />
              <Label htmlFor="typing-effect">Typing animation</Label>
            </div>
          </div>
          
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </aside>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSessionId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSession} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

//working well
// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"
// import { useSidebar } from "@/components/chat/sidebar-provider"
// import { Brain, Plus, MessageCircle, Settings, Menu, X, Loader2, Trash2 } from "lucide-react"
// import { useToast } from "@/components/ui/use-toast"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"

// // Define API URL from environment or default
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// interface ChatSession {
//   id: string;
//   title: string;
//   created_at: string;
//   last_message_at: string;
// }

// export function ChatSidebar() {
//   const { open, setOpen, isMobile } = useSidebar()
//   const { toast } = useToast()
//   const router = useRouter()
//   const [sessions, setSessions] = useState<ChatSession[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null)
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false)

//   // Fetch chat sessions on component mount
//   useEffect(() => {
//     fetchChatSessions()
//   }, [])

//   // Get auth token from localStorage
//   const getAuthToken = () => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('authToken')
//     }
//     return null
//   }

//   // Fetch chat sessions from the API
//   const fetchChatSessions = async () => {
//     setIsLoading(true)
//     try {
//       const token = getAuthToken()
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       })

//       if (!response.ok) {
//         throw new Error('Failed to fetch chat sessions')
//       }

//       const data = await response.json()
      
//       if (data.status && data.data.sessions) {
//         setSessions(data.data.sessions)
//       }
//     } catch (error) {
//       console.error('Error fetching chat sessions:', error)
//       toast({
//         title: "Error",
//         description: "Could not load your conversations. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Delete a chat session
//   const deleteSession = async () => {
//     if (!deleteSessionId) return

//     try {
//       const token = getAuthToken()
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/session/${deleteSessionId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       })

//       if (!response.ok) {
//         throw new Error('Failed to delete chat session')
//       }

//       // Remove from state
//       setSessions(sessions.filter(session => session.id !== deleteSessionId))
      
//       toast({
//         title: "Success",
//         description: "Conversation deleted successfully.",
//       })

//       // If we're currently viewing this session, redirect to new chat
//       const path = window.location.pathname
//       if (path === `/chat/${deleteSessionId}`) {
//         router.push('/chat/new')
//       }
//     } catch (error) {
//       console.error('Error deleting chat session:', error)
//       toast({
//         title: "Error",
//         description: "Could not delete conversation. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setDeleteSessionId(null)
//       setShowDeleteDialog(false)
//     }
//   }

//   // Handle delete button click
//   const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDeleteSessionId(sessionId)
//     setShowDeleteDialog(true)
//   }

//   // Format the chat title for display
//   const formatChatTitle = (title: string): string => {
//     if (!title) return "New Conversation"
    
//     // If it's a timestamp-based title, make it more user-friendly
//     if (title.match(/Chat \d{1,2}\/\d{1,2}\/\d{4}/)) {
//       return "Conversation " + title.replace("Chat ", "")
//     }
    
//     return title.length > 25 ? title.substring(0, 25) + "..." : title
//   }

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isMobile && open && (
//         <div className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
//       )}

//       {/* Mobile toggle button */}
//       <Button
//         variant="outline"
//         size="icon"
//         className="fixed left-4 top-4 z-30 md:hidden"
//         onClick={() => setOpen(!open)}
//       >
//         {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
//         <span className="sr-only">Toggle sidebar</span>
//       </Button>

//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r bg-muted/40 transition-transform duration-300 md:static md:translate-x-0 ${
//           open ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="flex h-14 items-center border-b px-4">
//           <Link href="/" className="flex items-center gap-2">
//             <Brain className="h-5 w-5 text-primary" />
//             <span className="font-semibold">MindfulAI</span>
//           </Link>
//         </div>

//         <div className="flex flex-col gap-2 p-4">
//           <Button asChild className="justify-start gap-2">
//             <Link href="/chat/new">
//               <Plus className="h-4 w-4" />
//               New conversation
//             </Link>
//           </Button>
//         </div>

//         <Separator />

//         <ScrollArea className="flex-1 px-4 py-2">
//           {isLoading ? (
//             <div className="flex justify-center items-center py-8">
//               <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
//             </div>
//           ) : sessions.length > 0 ? (
//             <div className="space-y-1">
//               <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Recent conversations</p>
//               {sessions.map((session) => (
//                 <div key={session.id} className="flex items-center gap-1">
//                   <Button 
//                     variant="ghost" 
//                     className="flex-1 justify-start gap-2 text-left" 
//                     asChild
//                     onClick={() => isMobile && setOpen(false)}
//                   >
//                     <Link href={`/chat/${session.id}`}>
//                       <MessageCircle className="h-4 w-4 shrink-0" />
//                       <span className="truncate">{formatChatTitle(session.title)}</span>
//                     </Link>
//                   </Button>
//                   <Button 
//                     variant="ghost" 
//                     size="icon" 
//                     className="h-8 w-8 opacity-60 hover:opacity-100"
//                     onClick={(e) => handleDeleteClick(e, session.id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                     <span className="sr-only">Delete</span>
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-8 text-center">
//               <MessageCircle className="h-8 w-8 mb-2 text-muted-foreground" />
//               <p className="text-sm text-muted-foreground">No conversations yet</p>
//               <Button 
//                 variant="link" 
//                 className="mt-2"
//                 onClick={() => router.push('/chat/new')}
//               >
//                 Start your first conversation
//               </Button>
//             </div>
//           )}
//         </ScrollArea>

//         <div className="border-t p-4">
//           <Button variant="outline" className="w-full justify-start gap-2" asChild>
//             <Link href="/settings">
//               <Settings className="h-4 w-4" />
//               Settings
//             </Link>
//           </Button>
//         </div>
//       </aside>

//       {/* Delete confirmation dialog */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this conversation? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel onClick={() => setDeleteSessionId(null)}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={deleteSession} className="bg-destructive text-destructive-foreground">
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   )
// }




// "use client"

// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"
// import { useSidebar } from "@/components/chat/sidebar-provider"
// import { Brain, Plus, MessageCircle, Settings, Menu, X } from "lucide-react"

// export function ChatSidebar() {
//   const { open, setOpen, isMobile } = useSidebar()

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isMobile && open && (
//         <div className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
//       )}

//       {/* Mobile toggle button */}
//       <Button
//         variant="outline"
//         size="icon"
//         className="fixed left-4 top-4 z-30 md:hidden"
//         onClick={() => setOpen(!open)}
//       >
//         {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
//         <span className="sr-only">Toggle sidebar</span>
//       </Button>

//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r bg-muted/40 transition-transform duration-300 md:static md:translate-x-0 ${
//           open ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="flex h-14 items-center border-b px-4">
//           <Link href="/" className="flex items-center gap-2">
//             <Brain className="h-5 w-5 text-primary" />
//             <span className="font-semibold">MindfulAI</span>
//           </Link>
//         </div>

//         <div className="flex flex-col gap-2 p-4">
//           <Button asChild className="justify-start gap-2">
//             <Link href="/chat/new">
//               <Plus className="h-4 w-4" />
//               New conversation
//             </Link>
//           </Button>
//         </div>

//         <Separator />

//         <ScrollArea className="flex-1 px-4 py-2">
//           <div className="space-y-1">
//             <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Recent conversations</p>
//             {recentChats.map((chat) => (
//               <Button key={chat.id} variant="ghost" className="w-full justify-start gap-2 text-left" asChild>
//                 <Link href={`/chat/${chat.id}`}>
//                   <MessageCircle className="h-4 w-4" />
//                   <span className="truncate">{chat.title}</span>
//                 </Link>
//               </Button>
//             ))}
//           </div>
//         </ScrollArea>

//         <div className="border-t p-4">
//           <Button variant="outline" className="w-full justify-start gap-2" asChild>
//             <Link href="/settings">
//               <Settings className="h-4 w-4" />
//               Settings
//             </Link>
//           </Button>
//         </div>
//       </aside>
//     </>
//   )
// }

// const recentChats = [
//   { id: "1", title: "Coping with anxiety" },
//   { id: "2", title: "Sleep improvement strategies" },
//   { id: "3", title: "Stress management techniques" },
//   { id: "4", title: "Mindfulness practice" },
//   { id: "5", title: "Work-life balance" },
// ]

