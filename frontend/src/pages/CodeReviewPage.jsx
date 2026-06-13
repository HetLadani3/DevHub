import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import { Sparkles, History, Loader2, Play, ChevronLeft, ChevronRight } from "lucide-react";

export default function CodeReviewPage() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    prism.highlightAll();
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "https://devhub-hxqe.onrender.com"}/api/review/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch review history", err);
    }
  };

  const handleReviewCode = async () => {
    setLoading(true);
    setReview("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://devhub-hxqe.onrender.com"}/api/review/get-review`,
        { code },
        { headers }
      );
      setReview(response.data.review);
      if (token) {
        fetchHistory(); // Refresh history
      }
    } catch (err) {
      setReview(err.response?.data?.message || "AI API is out of quota limits. Check API key.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setCode(item.code);
    setReview(item.review_text);
    setShowHistory(false);
  };

  return (
    <div className="flex h-[90vh] bg-slate-950 overflow-hidden relative">
      
      {/* Sidebar for History (gilding transition) */}
      {token && (
        <div
          className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 z-10 shrink-0 ${
            showHistory ? "w-64" : "w-0"
          } overflow-hidden flex flex-col justify-between`}
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="h-4 w-4" />
              Review History
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No past reviews found.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700/60 p-3 rounded-lg text-xs transition-colors"
                  >
                    <div className="font-semibold text-slate-300 truncate">
                      {item.code.slice(0, 30)}...
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Review Workspace */}
      <div className="flex-1 flex flex-col h-full">
        {/* Workspace Sub Header */}
        <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {token && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <History className="h-3.5 w-3.5 text-slate-400" />
                <span>History</span>
              </button>
            )}
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              AI Code Reviewer
            </h2>
          </div>
          <button
            onClick={handleReviewCode}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-800/50 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-purple-500/15 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Reviewing...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Review Code</span>
              </>
            )}
          </button>
        </div>

        {/* Editor Grid */}
        <div className="flex-1 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 h-[calc(90vh-53px)]">
          {/* Left: Code input editor */}
          <div className="p-4 overflow-y-auto flex flex-col h-full bg-slate-950">
            <div className="flex-1 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40 relative">
              <Editor
                value={code}
                onValueChange={(code) => setCode(code)}
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

          {/* Right: Markdown AI response */}
          <div className="p-6 overflow-y-auto bg-slate-900/20 h-full flex flex-col">
            {review ? (
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed overflow-x-auto">
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                    <p className="text-sm font-medium text-slate-400">Analyzing your code structure...</p>
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-10 w-10 text-slate-700 mb-3 animate-pulse" />
                    <p className="text-sm font-medium">Click "Review Code" to get AI feedback.</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
                      Our senior reviewer will highlight issues and suggest modern refactored variants.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
