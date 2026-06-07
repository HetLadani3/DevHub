import { Link } from "react-router-dom";
import { Sparkles, Users, Terminal, Code2, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-60 h-60 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-xs font-semibold text-emerald-400 mb-6 hover:scale-105 transition-transform">
          <Zap className="h-3.5 w-3.5" />
          <span>Supercharging Developer Workflows</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6 max-w-4xl leading-[1.1]">
          Write Better Code, <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Together.</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12 font-medium">
          DevHub gives you the power of AI-assisted code reviews and real-time multiplayer code rooms. Perfect for developer teams and pair programming.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Card 1: Code Review */}
          <Link
            to="/review"
            className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-8 rounded-2xl text-left hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] group-hover:bg-purple-500/10 transition-colors" />
            <div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                AI Code Review
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">Instant</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Paste your code and let our advanced Senior AI reviewer find logic issues, efficiency bottlenecks, and security vulnerabilities instantly.
              </p>
            </div>
            <span className="text-purple-400 text-sm font-semibold group-hover:underline flex items-center gap-1">
              Start Reviewing &rarr;
            </span>
          </Link>

          {/* Card 2: Code Room */}
          <Link
            to="/rooms"
            className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-8 rounded-2xl text-left hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] group-hover:bg-emerald-500/10 transition-colors" />
            <div>
              <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                Multiplayer Rooms
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">Live</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Create a coding room and invite your team to code together live. Features real-time typing synchronization, cursor sharing, and built-in room chat.
              </p>
            </div>
            <span className="text-emerald-400 text-sm font-semibold group-hover:underline flex items-center gap-1">
              Enter Code Rooms &rarr;
            </span>
          </Link>

        </div>

        {/* Feature list */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl w-full mt-24 border-t border-slate-900 pt-10 text-slate-500 text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <Code2 className="h-4 w-4 text-emerald-400/70" />
            <span>Interactive Editor</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400/70" />
            <span>JWT Security</span>
          </div>
          <div className="flex items-center justify-center col-span-2 md:col-span-1 gap-2">
            <Terminal className="h-4 w-4 text-blue-400/70" />
            <span>Syntax Highlighting</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-6 text-center text-slate-600 text-xs">
        <p>&copy; {new Date().getFullYear()} DevHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
