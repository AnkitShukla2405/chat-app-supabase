import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import ChatList from "./pages/ChatList"
import Chat from "./pages/Chat"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat-list" element={<ChatList />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App