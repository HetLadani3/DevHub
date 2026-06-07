import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import { Terminal, Users, Send, MessageSquare, LogOut, Clipboard, Check } from "lucide-react";
import { useRoom } from "../context/RoomContext";

export default function CodeRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const chatEndRef = useRef(null);
  const isLeavingRef = useRef(false);

  const {
    code,
    users,
    messages,
    setIsMinimized,
    setUnreadMessages,
    joinRoom,
    leaveRoom,
    updateCode,
    sendMessage,
  } = useRoom();

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    prism.highlightAll();

    // Join room or maximize via global RoomContext
    joinRoom(roomId, token);
    setUnreadMessages(0);

    return () => {
      // Minimize session on navigation (unmount) unless explicitly leaving
      if (!isLeavingRef.current) {
        setIsMinimized(true);
      }
    };
  }, [roomId, token]);

  useEffect(() => {
    // Scroll chat to bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCodeChange = (newCode) => {
    updateCode(newCode);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendMessage(chatInput);
    setChatInput("");
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (window.confirm("Are you sure you want to disconnect and leave the collaborative room?")) {
      isLeavingRef.current = true;
      leaveRoom();
      navigate("/rooms");
    }
  };

  if (!token) return null;

  return (
    <div className="flex h-[90vh] bg-slate-950 overflow-hidden relative">
      
      {/* Left Workspace: Code Editor */}
      <div className="flex-1 flex flex-col h-full">
        {/* Sub Header */}
        <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              Collaborative Workspace
            </h2>
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-850 px-3 py-1 rounded-lg">
              <span className="text-[11px] text-slate-500 font-mono select-all">Room: {roomId.slice(0, 8)}...</span>
              <button
                onClick={handleCopyRoomId}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Room ID"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Clipboard className="h-3 w-3" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Room</span>
          </button>
        </div>

        {/* Editor container */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950">
          <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40 relative min-h-full">
            <Editor
              value={code}
              onValueChange={handleCodeChange}
              highlight={(code) =>
                prism.highlight(code, prism.languages.javascript, "javascript")
              }
              padding={16}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: "100%",
                color: "#f8fafc",
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Active Users & Chat */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 h-full">
        
        {/* Active Users */}
        <div className="p-4 border-b border-slate-800/80 max-h-[30%] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-400" />
            Active Users ({users.length})
          </h3>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.sid} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-slate-350">
                  {u.username} {u.username === username && <span className="text-[10px] text-slate-500">(you)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Chat</h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
            {messages.map((msg, index) => {
              if (msg.system) {
                return (
                  <div key={index} className="text-center text-[10px] text-slate-500 italic py-1 bg-slate-950/20 rounded-md border border-slate-950/30">
                    {msg.text}
                  </div>
                );
              }

              const isMe = msg.username === username;
              return (
                <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] text-slate-500 font-semibold mb-0.5 px-1">{msg.username}</span>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to room..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
