import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useNavigate } from "react-router-dom"

type ChatItem = {
  id: string
  lastMessage: string
}

export default function ChatList() {
  const [conversations, setConversations] = useState<ChatItem[]>([])
  const navigate = useNavigate()

useEffect(() => {
  fetchConversations()

  const channel = supabase
    .channel("chat-list")
    .on(
      "postgres_changes",
      {
        event: "*", // 🔥 important
        schema: "public",
        table: "messages",
      },
      (payload) => {
        console.log("Realtime fired:", payload)
        fetchConversations()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])

  const fetchConversations = async () => {
    // get all conversations
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")

    if (!convs) return

    // fetch last message for each conversation
    const chats: ChatItem[] = await Promise.all(
      convs.map(async (conv) => {
        const { data: msgs } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)

        return {
          id: conv.id,
          lastMessage: msgs?.[0]?.content || "No messages yet",
        }
      })
    )

    setConversations(chats)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Chats</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="text-gray-400">No conversations yet</p>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              className="p-4 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition"
            >
              <p className="font-semibold">Conversation</p>
              <p className="text-sm text-gray-400 truncate">
                {conv.lastMessage}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}