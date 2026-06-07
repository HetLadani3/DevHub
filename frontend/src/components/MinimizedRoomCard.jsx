import { useNavigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";
import { Maximize2, LogOut, Users, MessageSquare } from "lucide-react";

export default function MinimizedRoomCard() {
  const { currentRoomId, isMinimized, setIsMinimized, users, unreadMessages, leaveRoom } = useRoom();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Only display if the user is in an active session and it is minimized
  if (!currentRoomId || !isMinimized || !token) return null;

  const handleMaximize = () => {
    setIsMinimized(false);
    navigate(`/room/${currentRoomId}`);
  };

  const handleLeave = (e) => {
    e.stopPropagation(); // Prevent trigger navigate/maximize
    if (window.confirm("Are you sure you want to disconnect and leave the collaborative room?")) {
      leaveRoom();
      navigate("/rooms");
    }
  };

  return (
    <div
      onClick={handleMaximize}
      className="fixed bottom-6 right-6 z-[9999] bg-slate-900/95 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl shadow-2xl w-80 cursor-pointer hover:-translate-y-1 hover:shadow-emerald-500/5 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            Live Room Session
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMaximize}
            className="p-1 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Maximize Workspace"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleLeave}
            className="p-1 rounded bg-rose-500/10 hover:bg-rose-550 text-rose-450 hover:bg-rose-500 hover:text-slate-950 text-rose-400 transition-colors"
            title="Leave Session"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
          Active Workspace
        </h4>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5 select-all">
          ID: {currentRoomId}
        </p>
      </div>

      <div className="flex items-center gap-4 border-t border-slate-800/60 pt-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          <span>{users.length} active</span>
        </div>
        {unreadMessages > 0 && (
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold animate-pulse">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{unreadMessages} new message{unreadMessages > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}
