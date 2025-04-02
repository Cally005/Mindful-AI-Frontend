"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MoreHorizontal, Download, Plus, Filter, RefreshCw } from "lucide-react"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState(users)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (query.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.id.toString().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Users</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-8" value={searchQuery} onChange={handleSearch} />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === "Active" ? "default" : user.status === "Inactive" ? "secondary" : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.joined}</TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>View chat history</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Edit user</DropdownMenuItem>
                      <DropdownMenuItem>Reset password</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Deactivate account</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Mock user data
const users = [
  {
    id: 1001,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    status: "Active",
    joined: "Mar 15, 2023",
    lastActive: "Today",
  },
  {
    id: 1002,
    name: "Michael Chen",
    email: "michael.c@example.com",
    status: "Active",
    joined: "Apr 3, 2023",
    lastActive: "Yesterday",
  },
  {
    id: 1003,
    name: "Emma Williams",
    email: "emma.w@example.com",
    status: "Active",
    joined: "Jan 22, 2023",
    lastActive: "3 days ago",
  },
  {
    id: 1004,
    name: "David Kim",
    email: "david.k@example.com",
    status: "Inactive",
    joined: "Feb 10, 2023",
    lastActive: "2 weeks ago",
  },
  {
    id: 1005,
    name: "Olivia Martinez",
    email: "olivia.m@example.com",
    status: "Active",
    joined: "May 5, 2023",
    lastActive: "Today",
  },
  {
    id: 1006,
    name: "James Wilson",
    email: "james.w@example.com",
    status: "Suspended",
    joined: "Dec 12, 2022",
    lastActive: "1 month ago",
  },
  {
    id: 1007,
    name: "Sophia Lee",
    email: "sophia.l@example.com",
    status: "Active",
    joined: "Jun 18, 2023",
    lastActive: "Yesterday",
  },
  {
    id: 1008,
    name: "Benjamin Taylor",
    email: "ben.t@example.com",
    status: "Active",
    joined: "Jul 30, 2023",
    lastActive: "Today",
  },
  {
    id: 1009,
    name: "Ava Garcia",
    email: "ava.g@example.com",
    status: "Inactive",
    joined: "Aug 14, 2023",
    lastActive: "3 weeks ago",
  },
  {
    id: 1010,
    name: "Noah Rodriguez",
    email: "noah.r@example.com",
    status: "Active",
    joined: "Sep 2, 2023",
    lastActive: "2 days ago",
  },
]

