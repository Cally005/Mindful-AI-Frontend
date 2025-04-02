"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Download, Eye, Calendar, Brain } from "lucide-react"

export default function ChatLogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLogs, setFilteredLogs] = useState(chatLogs)
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (query.trim() === "") {
      setFilteredLogs(chatLogs)
    } else {
      const filtered = chatLogs.filter(
        (log) =>
          log.userId.toString().includes(query) ||
          log.userName.toLowerCase().includes(query) ||
          log.summary.toLowerCase().includes(query),
      )
      setFilteredLogs(filtered)
    }
  }

  const viewChatLog = (log: ChatLog) => {
    setSelectedLog(log)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Chat Logs</h2>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chat logs..." className="pl-8" value={searchQuery} onChange={handleSearch} />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {log.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{log.userName}</div>
                      <div className="text-xs text-muted-foreground">ID: {log.userId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{log.date}</TableCell>
                <TableCell>{log.duration}</TableCell>
                <TableCell>{log.messageCount}</TableCell>
                <TableCell className="max-w-[200px] truncate">{log.summary}</TableCell>
                <TableCell>
                  {log.flags.map((flag) => (
                    <Badge
                      key={flag}
                      variant={flag === "Crisis Alert" ? "destructive" : flag === "Follow-up" ? "default" : "secondary"}
                      className="mr-1"
                    >
                      {flag}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => viewChatLog(log)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View chat log</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chat Log #{selectedLog?.id}</DialogTitle>
            <DialogDescription>
              Conversation with {selectedLog?.userName} on {selectedLog?.date}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>User ID: {selectedLog.userId}</div>
                <div>Duration: {selectedLog.duration}</div>
              </div>

              <div className="space-y-4">
                {selectedLog.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.sender === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.sender === "assistant" ? (
                        <Avatar className="h-8 w-8 mt-0.5">
                          <AvatarFallback>
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-8 w-8 mt-0.5">
                          <AvatarFallback>
                            {selectedLog.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          {message.sender === "assistant" ? "MindfulAI" : selectedLog.userName}
                        </p>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs mt-1 opacity-70">{message.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Analysis</h4>
                <p className="text-sm text-muted-foreground mb-2">{selectedLog.analysis}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedLog.flags.map((flag) => (
                    <Badge
                      key={flag}
                      variant={flag === "Crisis Alert" ? "destructive" : flag === "Follow-up" ? "default" : "secondary"}
                    >
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Types
interface ChatMessage {
  sender: "user" | "assistant"
  content: string
  timestamp: string
}

interface ChatLog {
  id: number
  userId: number
  userName: string
  date: string
  duration: string
  messageCount: number
  summary: string
  flags: string[]
  messages: ChatMessage[]
  analysis: string
}

// Mock data for chat logs
const chatLogs: ChatLog[] = [
  {
    id: 5001,
    userId: 1001,
    userName: "Sarah Johnson",
    date: "Mar 15, 2023",
    duration: "15 min",
    messageCount: 12,
    summary: "Discussion about anxiety related to upcoming job interview",
    flags: ["Follow-up"],
    messages: [
      {
        sender: "user",
        content: "I'm feeling really anxious about my job interview tomorrow.",
        timestamp: "10:15 AM",
      },
      {
        sender: "assistant",
        content:
          "I understand that job interviews can be stressful. Can you tell me more about what's making you feel anxious?",
        timestamp: "10:15 AM",
      },
      {
        sender: "user",
        content:
          "I'm worried I won't be able to answer their technical questions. I've been preparing, but I still feel like I don't know enough.",
        timestamp: "10:16 AM",
      },
      {
        sender: "assistant",
        content:
          "That's a common concern. Remember that it's okay not to know everything. Would you like to practice some interview techniques that might help you feel more confident?",
        timestamp: "10:17 AM",
      },
      {
        sender: "user",
        content: "Yes, that would be helpful.",
        timestamp: "10:18 AM",
      },
    ],
    analysis:
      "User shows moderate anxiety about job performance. Recommended coping strategies and offered practical interview preparation techniques. Suggest follow-up to check on interview outcome.",
  },
  {
    id: 5002,
    userId: 1003,
    userName: "Emma Williams",
    date: "Mar 16, 2023",
    duration: "22 min",
    messageCount: 18,
    summary: "Discussion about sleep difficulties and potential solutions",
    flags: ["Sleep Issues"],
    messages: [
      {
        sender: "user",
        content: "I've been having trouble sleeping lately. I can't seem to fall asleep until 2 or 3 AM.",
        timestamp: "11:30 PM",
      },
      {
        sender: "assistant",
        content:
          "I'm sorry to hear you're having sleep difficulties. Can you tell me more about your bedtime routine and any changes in your life recently?",
        timestamp: "11:31 PM",
      },
      {
        sender: "user",
        content: "I usually work on my laptop until I go to bed. I've been stressed about a project deadline.",
        timestamp: "11:32 PM",
      },
    ],
    analysis:
      "User reports insomnia likely related to screen time before bed and work stress. Provided sleep hygiene recommendations and stress management techniques. Suggested creating a wind-down routine without screens.",
  },
  {
    id: 5003,
    userId: 1006,
    userName: "James Wilson",
    date: "Mar 17, 2023",
    duration: "35 min",
    messageCount: 24,
    summary: "Discussion about feelings of hopelessness and suicidal thoughts",
    flags: ["Crisis Alert", "Urgent Follow-up"],
    messages: [
      {
        sender: "user",
        content: "I don't see the point of anything anymore. Nothing matters.",
        timestamp: "2:15 AM",
      },
      {
        sender: "assistant",
        content:
          "I'm concerned about what you're sharing. It sounds like you're going through a really difficult time. Have you had thoughts about harming yourself?",
        timestamp: "2:16 AM",
      },
      {
        sender: "user",
        content: "Sometimes I think about just ending it all.",
        timestamp: "2:17 AM",
      },
    ],
    analysis:
      "User expressed suicidal ideation. Provided crisis resources and encouraged professional help. Escalated to crisis team. User agreed to contact local crisis services and provided confirmation of safety plan.",
  },
  {
    id: 5004,
    userId: 1005,
    userName: "Olivia Martinez",
    date: "Mar 18, 2023",
    duration: "18 min",
    messageCount: 15,
    summary: "Discussion about work-life balance and setting boundaries",
    flags: [],
    messages: [
      {
        sender: "user",
        content: "I feel like I'm always working. I can't seem to disconnect from my job.",
        timestamp: "7:45 PM",
      },
      {
        sender: "assistant",
        content:
          "It can be challenging to maintain boundaries between work and personal life, especially in today's connected world. How has this been affecting you?",
        timestamp: "7:46 PM",
      },
      {
        sender: "user",
        content: "I'm exhausted all the time, and I haven't seen my friends in weeks.",
        timestamp: "7:47 PM",
      },
    ],
    analysis:
      "User struggling with work-life boundaries leading to social isolation and fatigue. Discussed practical boundary-setting strategies and importance of social connections for mental health.",
  },
  {
    id: 5005,
    userId: 1002,
    userName: "Michael Chen",
    date: "Mar 19, 2023",
    duration: "25 min",
    messageCount: 20,
    summary: "Discussion about relationship conflict and communication strategies",
    flags: ["Follow-up"],
    messages: [
      {
        sender: "user",
        content: "My partner and I keep having the same argument over and over. It never gets resolved.",
        timestamp: "6:20 PM",
      },
      {
        sender: "assistant",
        content:
          "Recurring arguments can be frustrating. Can you tell me more about what happens during these arguments?",
        timestamp: "6:21 PM",
      },
      {
        sender: "user",
        content: "We both get defensive and end up not listening to each other. Then we just walk away angry.",
        timestamp: "6:22 PM",
      },
    ],
    analysis:
      "User experiencing communication difficulties in relationship. Provided active listening techniques and conflict resolution strategies. Recommended 'time-out' approach when emotions escalate.",
  },
]

