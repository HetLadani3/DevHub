import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Link as LinkIcon, AlertCircle } from "lucide-react";

export default function CodeRoomDashboard() {
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    setActionLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://devhub-backend.onrender.com"}/api/rooms`,
        { name: newRoomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Navigate to the newly created room
      navigate(`/room/${response.data.roomId}`);
    } catch (err) {
      setError("Failed to create code room.");
      setActionLoading(false);
    }
  };

  const handleJoinRoomDirectly = (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    navigate(`/room/${joinRoomId.trim()}`);
  };

  if (!token) return null;

  return (
    <div className="min-h-[90vh] bg-slate-950 text-slate-100 p-8 flex items-center justify-center relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Collaborative Coding Rooms
          </h2>
          <p className="text-slate-455 text-slate-400 text-sm max-w-md mx-auto">
            Create a live workspace and pair program in real-time, or enter a shared Meeting ID to join an existing session.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg text-sm mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Create Room Box */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-950/50 hover:border-slate-700/50 transition-colors">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="h-6 w-6 text-emerald-400" />
              Create Room
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Start a new multiplayer coding room and share the link/ID with collaborators.
            </p>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <input
                type="text"
                required
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="e.g. Frontend Refactor"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-sm transition-colors"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
              >
                {actionLoading ? "Creating..." : "Launch Room"}
              </button>
            </form>
          </div>

          {/* Join Room Box */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-950/50 hover:border-slate-700/50 transition-colors">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-400" />
              Join Room ID
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Have a Meeting ID? Enter it below to join a live collaborative workspace.
            </p>
            <form onSubmit={handleJoinRoomDirectly} className="space-y-4">
              <input
                type="text"
                required
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Paste Room ID here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 text-sm transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                <span>Join Workspace</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
