import type React from "react"
import { SidebarProvider } from "@/components/admin/sidebar-provider"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { AdminNav } from "@/components/admin/admin-nav"
import { Shield } from "lucide-react"
import { ProtectedRoute } from '@/components/protected-route';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // <SidebarProvider>
    // <ProtectedRoute adminOnly>
      <div className="flex min-h-screen">
        {/* <AdminSidebar /> */}
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">MindfulAI Admin</span>
            </div>
            <div className="flex items-center gap-4">
              {/* <ModeToggle /> */}
              {/* <AdminNav /> */}
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
       /* </ProtectedRoute> */
    // </SidebarProvider>
  )
}

