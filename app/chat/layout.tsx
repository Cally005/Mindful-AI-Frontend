import type React from "react"
import { SidebarProvider } from "@/components/chat/sidebar-provider"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/chat/user-nav"
import { Brain } from "lucide-react"
import Link from "next/link"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <ChatSidebar />
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">MindfulAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/resources" className="text-sm font-medium hover:text-primary">
                Resources
              </Link>
              <ModeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

