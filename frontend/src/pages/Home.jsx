import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Video, ShieldCheck, Cpu, Terminal } from "lucide-react";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-4xl w-full text-left sm:text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-blue-500 font-mono text-xs uppercase tracking-widest rounded-sm">
          <Terminal className="w-3.5 h-3.5" />
          <span>Protocol: WebRTC // Socket.io</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
          REAL-TIME COLLABORATION <br />
          <span className="text-blue-500 font-mono font-normal tracking-normal text-3xl sm:text-5xl block mt-2">
            & P2P VIDEO MESH_
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl sm:mx-auto font-normal leading-relaxed">
          Low-latency video conferencing, synchronized whiteboard canvas
          drawing, and instant peer-to-peer data channel transfers within
          private cryptographic rooms.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          {user ? (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-sm w-full max-w-md text-left sm:text-center space-y-3">
              <div className="flex items-center sm:justify-center space-x-2 text-xs font-mono text-blue-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                <span>SESSION ACTIVE // {user.username.toUpperCase()}</span>
              </div>
              <p className="text-xs text-slate-400">
                Room creation and signaling grid will deploy in Step 3.
              </p>
              <div className="p-2.5 bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs">
                STATUS: READY FOR CONNECTION
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="px-6 py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-mono font-bold text-xs uppercase tracking-widest rounded-sm text-center transition active:scale-[0.99]"
              >
                Initialize Session
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-mono text-xs uppercase tracking-widest rounded-sm text-center transition"
              >
                Existing Access
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          <div className="p-5 rounded-sm bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
            <Video className="w-5 h-5 text-blue-500 mb-3" />
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
              Multi-User Video
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Direct WebRTC media streams with automated signaling fallback.
            </p>
          </div>
          <div className="p-5 rounded-sm bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
            <Cpu className="w-5 h-5 text-emerald-500 mb-3" />
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
              Canvas Whiteboard
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Low-latency coordinate broadcasting via bidirectional websockets.
            </p>
          </div>
          <div className="p-5 rounded-sm bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
            <ShieldCheck className="w-5 h-5 text-purple-500 mb-3" />
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
              Encrypted Rooms
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              JWT authenticated endpoints with isolated private room IDs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
