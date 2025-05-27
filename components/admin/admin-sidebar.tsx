"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/admin/sidebar-provider"
import {
  Shield,
  Menu,
  X,
  Home,
  Users,
  Database,
  MessageSquare,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

export function AdminSidebar() {
  const { open, setOpen, isMobile } = useSidebar()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
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
        className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-muted/40 transition-all duration-300 md:static ${
          open ? "w-64" : "w-[70px]"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/admin/dashboard" className={`flex items-center gap-2 ${!open && "justify-center"}`}>
            <Shield className="h-5 w-5 text-primary" />
            {open && <span className="font-semibold">MindfulAI Admin</span>}
          </Link>
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="h-8 w-8">
              {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-1">
            <Button
              variant={isActive("/admin/dashboard") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 text-left ${!open && "justify-center px-0"}`}
              asChild
            >
              <Link href="/admin/dashboard">
                <Home className="h-4 w-4" />
                {open && <span>Dashboard</span>}
              </Link>
            </Button>
            <Button
              variant={isActive("/admin/users") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 text-left ${!open && "justify-center px-0"}`}
              asChild
            >
              <Link href="/admin/users">
                <Users className="h-4 w-4" />
                {open && <span>Manage Users</span>}
              </Link>
            </Button>
            <Button
              variant={isActive("/admin/knowledge-base") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 text-left ${!open && "justify-center px-0"}`}
              asChild
            >
              <Link href="/admin/knowledge-base">
                <Database className="h-4 w-4" />
                {open && <span>Knowledge Base</span>}
              </Link>
            </Button>
            <Button
              variant={isActive("/admin/chat-logs") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 text-left ${!open && "justify-center px-0"}`}
              asChild
            >
              <Link href="/admin/chat-logs">
                <MessageSquare className="h-4 w-4" />
                {open && <span>Chat Logs</span>}
              </Link>
            </Button>
            <Button
              variant={isActive("/admin/analytics") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 text-left ${!open && "justify-center px-0"}`}
              asChild
            >
              <Link href="/admin/analytics">
                <BarChart2 className="h-4 w-4" />
                {open && <span>Analytics</span>}
              </Link>
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            <Button
              variant={isActive("/admin/settings") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 text-left ${!open && "justify-center px-0"}`}
              asChild
            >
              <Link href="/admin/settings">
                <Settings className="h-4 w-4" />
                {open && <span>Settings</span>}
              </Link>
            </Button>
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <Button variant="outline" className={`w-full justify-start gap-2 ${!open && "justify-center px-0"}`} asChild>
            <Link href="/admin/login">
              <Shield className="h-4 w-4" />
              {open && <span>Log out</span>}
            </Link>
          </Button>
        </div>
      </aside>
    </>
  )
}

