import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import {
  Video,
  ShieldCheck,
  Cpu,
  Terminal,
  Plus,
  ArrowRight,
  Activity,
  GitBranch,
  Shield,
} from "lucide-react";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/rooms/create", { roomName });
      navigate(`/room/${data.roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    setLoading(true);
    setError("");
    try {
      await API.get(`/rooms/${joinRoomId.trim()}`);
      navigate(`/room/${joinRoomId.trim()}`);
    } catch (err) {
      setError("Access Denied: Room ID does not exist in system database!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16">
        <div className="max-w-5xl w-full text-left sm:text-center space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-slate-900 border border-slate-800 text-blue-500 font-mono text-xs uppercase tracking-widest rounded-sm">
            <Terminal className="w-4 h-4" />
            <span>Protocol: WebRTC // Socket.io</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
            REAL-TIME COLLABORATION <br />
            <span className="text-blue-500 font-mono font-normal tracking-normal text-3xl sm:text-5xl block mt-2">
              & P2P VIDEO MESH_
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-3xl sm:mx-auto font-normal leading-relaxed">
            Low-latency video conferencing, synchronized whiteboard canvas
            drawing, and instant peer-to-peer data channel transfers within
            private cryptographic rooms.
          </p>

          {error && (
            <div className="max-w-xl mx-auto bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-sm text-sm font-mono text-center">
              {error}
            </div>
          )}

          <div className="pt-4 flex justify-center">
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
                <div className="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-sm">
                  <div className="flex items-center space-x-2 text-blue-500 font-mono text-xs uppercase tracking-wider mb-2">
                    <Plus className="w-4 h-4" />
                    <span>New Session</span>
                  </div>
                  <h3 className="font-bold text-xl text-white mb-2">
                    Create Room
                  </h3>
                  <p className="text-slate-400 text-xs mb-6">
                    Initialize a new video & whiteboard channel.
                  </p>
                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Room Name (e.g. Design Sync)"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-sm text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-blue-500 transition"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-sm transition duration-150 disabled:opacity-50"
                    >
                      {loading ? "Creating..." : "Initialize Room"}
                    </button>
                  </form>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-sm">
                  <div className="flex items-center space-x-2 text-emerald-500 font-mono text-xs uppercase tracking-wider mb-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>Existing Channel</span>
                  </div>
                  <h3 className="font-bold text-xl text-white mb-2">
                    Join Room
                  </h3>
                  <p className="text-slate-400 text-xs mb-6">
                    Connect to an active room ID.
                  </p>
                  <form onSubmit={handleJoinRoom} className="space-y-4">
                    <input
                      type="text"
                      required
                      placeholder="Enter Room ID (e.g. abc-defg-hij)"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-sm text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-emerald-500 transition"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-mono font-bold text-xs uppercase tracking-widest rounded-sm transition duration-150 disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Connect Channel"}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full max-w-md">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-950 font-mono font-bold text-sm uppercase tracking-widest rounded-sm text-center transition active:scale-[0.99]"
                >
                  Initialize Session
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-mono font-bold text-sm uppercase tracking-widest rounded-sm text-center transition"
                >
                  Existing Access
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
            <div className="p-6 rounded-sm bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
              <Video className="w-6 h-6 text-blue-500 mb-4" />
              <h4 className="font-bold text-base text-white font-mono uppercase tracking-wider">
                Multi-User Video
              </h4>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Direct WebRTC media streams with automated signaling fallback.
              </p>
            </div>
            <div className="p-6 rounded-sm bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
              <Cpu className="w-6 h-6 text-emerald-500 mb-4" />
              <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
                Canvas Whiteboard
              </h4>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Low-latency coordinate broadcasting via bidirectional
                websockets.
              </p>
            </div>
            <div className="p-6 rounded-sm bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
              <ShieldCheck className="w-6 h-6 text-purple-500 mb-4" />
              <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
                Encrypted Rooms
              </h4>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                JWT authenticated endpoints with isolated private room IDs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800 bg-slate-900/30 py-6 px-6 mt-12 text-slate-400 font-mono text-xs shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              System Status: All Services Operational
            </span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <a
              href="https://github.com/manikkori/codealpha__RealTimeCommunicationApp"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-white transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-blue-500" />
              <span>GitHub Repo</span>
            </a>
            <span className="text-slate-800">|</span>
            <div className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              <span>E2E WebRTC Mesh</span>
            </div>
          </div>

          <div className="text-slate-500">
            &copy; {new Date().getFullYear()} CommApp_ // Engineered by Manik
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
