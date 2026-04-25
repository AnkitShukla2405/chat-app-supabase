import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useParams } from "react-router-dom"

export default function Chat() {
  const { id } = useParams()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!id) return

    const init = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })

      setMessages(msgs || [])
    }

    init()

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.new.conversation_id === id) {
            setMessages((prev) => [...prev, payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return

    await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: user.id,
      content: newMessage,
    })

    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div className="bg-gray-800 px-4 py-2 rounded max-w-xs">
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 flex gap-2 bg-gray-800">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-3 rounded bg-gray-700"
          placeholder="Type message..."
        />
        <button onClick={sendMessage} className="bg-blue-600 px-4 rounded">
          Send
        </button>
      </div>
    </div>
  )
}