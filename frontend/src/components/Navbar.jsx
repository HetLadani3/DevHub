import { Link, useNavigate } from "react-router-dom";
import { LogOut, Terminal, Users, Sparkles, User as UserIcon } from "lucide-react";

import { RoomProvider, useRoom } from "../context/RoomContext";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const { leaveRoom } = useRoom();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    leaveRoom();
    navigate("/auth");
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:text-emerald-400 transition-colors">
        <Terminal className="h-6 w-6 text-emerald-400 animate-pulse" />
        <span>Dev<span className="text-emerald-400">Hub</span></span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/review" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
          <Sparkles className="h-4 w-4 text-purple-400" />
          Code Review
        </Link>
        <Link to="/rooms" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
          <Users className="h-4 w-4 text-blue-400" />
          Code Rooms
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {token ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-full text-sm font-medium text-slate-200">
              <UserIcon className="h-4 w-4 text-slate-400" />
              <span>{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-5 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
          >
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
}
