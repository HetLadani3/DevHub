import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import CodeReviewPage from "./pages/CodeReviewPage";
import CodeRoomDashboard from "./pages/CodeRoomDashboard";
import CodeRoomPage from "./pages/CodeRoomPage";
import { RoomProvider } from "./context/RoomContext";
import MinimizedRoomCard from "./components/MinimizedRoomCard";

function App() {
  return (
    <Router>
      <RoomProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/review" element={<CodeReviewPage />} />
              <Route path="/rooms" element={<CodeRoomDashboard />} />
              <Route path="/room/:roomId" element={<CodeRoomPage />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <MinimizedRoomCard />
        </div>
      </RoomProvider>
    </Router>
  );
}

export default App;
