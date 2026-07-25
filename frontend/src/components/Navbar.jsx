import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Video, Menu, X, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            setMobileMenuOpen(false);
            navigate('/login');
        }
    };

    return (
        <nav className="bg-slate-900 border-b border-indigo-500/20 sticky top-0 z-50 text-white shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    <Video className="w-7 h-7 text-indigo-400" />
                    <span>CommApp</span>
                </Link>

                <div className="hidden sm:flex items-center space-x-6">
                    {user ? (
                        <>
                            <div className="flex items-center space-x-2 text-indigo-300 font-medium text-sm bg-slate-800 px-3 py-1.5 rounded-full border border-indigo-500/30">
                                <User className="w-4 h-4" />
                                <span>{user.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-4 py-1.5 rounded-full text-sm font-bold transition duration-200"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm transition">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/25 transition duration-200"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                <div className="sm:hidden flex items-center">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex justify-end sm:hidden">
                    <div
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 transition-opacity"
                    />

                    <div className="relative w-72 h-full bg-slate-900 shadow-2xl flex flex-col justify-between z-10 border-l border-indigo-500/20 p-6">
                        <div>
                            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                                <span className="font-extrabold text-lg bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                    Navigation
                                </span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mt-6 space-y-4">
                                {user ? (
                                    <div className="p-4 rounded-xl bg-slate-800/80 border border-indigo-500/30">
                                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Logged in as</p>
                                        <p className="font-extrabold text-base text-white truncate">{user.username}</p>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pt-2">
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full py-3 text-center bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full py-3 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
                                        >
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {user && (
                            <div className="pt-6 border-t border-slate-800">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center space-x-2 w-full py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-black rounded-xl transition"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;