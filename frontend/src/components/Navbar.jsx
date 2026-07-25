import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogOut, Video, Menu, X, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      setMobileMenuOpen(false);
      navigate("/login");
    }
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2.5 tracking-tight font-bold text-lg text-white"
        >
          <div className="bg-blue-600 text-white p-1.5 rounded-sm">
            <Video className="w-5 h-5" />
          </div>
          <span className="font-mono uppercase tracking-wider text-base">
            CommApp_
          </span>
        </Link>

        <div className="hidden sm:flex items-center space-x-5">
          {user ? (
            <>
              <div className="flex items-center space-x-2 text-slate-300 bg-slate-900 px-3 py-1.5 border border-slate-800 text-xs font-mono rounded-sm">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 bg-transparent hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 border border-slate-800 hover:border-rose-500/30 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white hover:bg-slate-200 text-slate-950 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-sm transition duration-150"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-sm focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end sm:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 transition-opacity"
          />

          <div className="relative w-64 h-full bg-slate-950 flex flex-col justify-between z-10 border-l border-slate-800 p-5">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                  Menu
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-sm transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {user ? (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-sm">
                    <p className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-1">
                      User Profile
                    </p>
                    <p className="font-bold text-sm text-white truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 text-center bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-mono text-xs uppercase tracking-wider rounded-sm transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 text-center bg-white text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-sm transition"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {user && (
              <div className="pt-5 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 w-full py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 font-mono text-xs uppercase tracking-wider rounded-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
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
