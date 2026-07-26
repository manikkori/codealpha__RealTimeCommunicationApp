import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";

const ChatBox = ({ socket, roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const currentUsername =
    user?.username || `Guest-${Math.floor(Math.random() * 899 + 100)}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive-message", handleReceiveMessage);
    return () => socket.off("receive-message", handleReceiveMessage);
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const messageData = {
      roomId,
      message: input.trim(),
      sender: currentUsername,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send-message", messageData);
    setInput("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-sm overflow-hidden">
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center space-x-2 shrink-0">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
          Live Data Channel // Chat
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-sm">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs uppercase tracking-wider">
            No transmissions recorded yet.
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.sender === currentUsername || msg.sender === user?.username;
            return (
              <div
                key={index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${isMe ? "text-blue-400" : "text-emerald-400"}`}
                  >
                    {msg.sender}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-sm max-w-[80%] break-words border ${
                    isMe
                      ? "bg-blue-600/10 border-blue-500/30 text-slate-100"
                      : "bg-slate-950 border-slate-800 text-slate-200"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Broadcast message..."
          className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-sm text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-blue-500 transition"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
