import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Video, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12">
            <div className="max-w-3xl text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold">
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Real-Time WebRTC & Socket.io Powered</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                    Secure Video Calling & <br />
                    <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                        Live Collaboration
                    </span>
                </h1>

                <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
                    Experience peer-to-peer HD video conferencing, interactive whiteboard drawing, and instant file sharing in private encrypted rooms.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    {user ? (
                        <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl w-full max-w-md text-center space-y-4 shadow-xl">
                            <h3 className="font-bold text-lg text-white">Ready to connect, {user.username}?</h3>
                            <p className="text-xs text-slate-400">Room creation and join controls will be implemented in Step 3!</p>
                            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-300 font-mono text-sm">
                                System Status: Connected & Authenticated ✅
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 transition active:scale-[0.99]"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl border border-slate-800 transition"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-2xl mx-auto text-left">
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <Video className="w-6 h-6 text-indigo-400 mb-2" />
                        <h4 className="font-bold text-sm text-white">Multi-User Video</h4>
                        <p className="text-xs text-slate-400 mt-1">Low-latency P2P mesh streaming.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <Zap className="w-6 h-6 text-purple-400 mb-2" />
                        <h4 className="font-bold text-sm text-white">Live Whiteboard</h4>
                        <p className="text-xs text-slate-400 mt-1">Real-time canvas drawing synchronization.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <ShieldCheck className="w-6 h-6 text-blue-400 mb-2" />
                        <h4 className="font-bold text-sm text-white">Encrypted Rooms</h4>
                        <p className="text-xs text-slate-400 mt-1">Secure JWT access and room protection.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;