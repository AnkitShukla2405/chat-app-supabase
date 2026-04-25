import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useNavigate } from "react-router-dom"

export default function ChatList() {
  const [conversations, setConversations] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")

    if (!error) {
      setConversations(data || [])
    }
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
          className="bg-red-500 px-4 py-2 rounded"
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
              className="p-4 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
            >
              <p>Conversation: {conv.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}