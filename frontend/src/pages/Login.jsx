import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Verify credentials.",
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] flex flex-col justify-center px-4 py-12 max-w-md mx-auto bg-slate-950 text-slate-100">
      <div className="border border-slate-800 bg-slate-900/40 p-6 sm:p-8 rounded-sm">
        <div className="mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-blue-500 mb-2">
            <LogIn className="w-5 h-5" />
            <span className="font-mono text-xs uppercase tracking-widest">
              System Auth
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sign In
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Access secure real-time communication rooms.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-sm mb-5 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 font-mono text-xs uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="developer@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 font-mono text-xs uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-blue-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-slate-200 text-slate-950 font-mono font-bold text-xs uppercase tracking-widest rounded-sm transition duration-150 active:scale-[0.99]"
            >
              Authenticate
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800 mt-6 pt-4 text-center">
          <p className="text-xs text-slate-400">
            No active session?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:underline font-mono"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
