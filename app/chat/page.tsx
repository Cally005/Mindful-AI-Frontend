import { redirect } from "next/navigation"

export default function ChatPage() {
  // Redirect to the most recent chat or new chat
  redirect("/chat/new")
}

