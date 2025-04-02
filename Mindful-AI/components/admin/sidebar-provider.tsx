"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(!isMobile)

  // Close sidebar on mobile when navigating
  React.useEffect(() => {
    if (isMobile) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [isMobile])

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      isMobile,
    }),
    [open, setOpen, isMobile],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

