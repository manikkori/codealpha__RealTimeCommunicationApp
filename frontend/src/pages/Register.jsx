import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Try a different email.",
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col justify-center px-6 py-16 max-w-lg mx-auto bg-slate-950 text-slate-100">
      <div className="border border-slate-800 bg-slate-900/40 p-8 sm:p-10 rounded-sm">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-2.5 text-blue-500 mb-3">
            <UserPlus className="w-6 h-6" />
            <span className="font-mono text-sm uppercase tracking-widest">
              User Registration
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Initialize identity for real-time collaboration.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-sm mb-6 text-sm font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 font-mono text-xs uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="manik_dev"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-sm text-white placeholder-slate-600 text-base font-mono focus:outline-none focus:border-blue-500 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 font-mono text-xs uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="developer@example.com"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-sm text-white placeholder-slate-600 text-base font-mono focus:outline-none focus:border-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 font-mono text-xs uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-sm text-white placeholder-slate-600 text-base font-mono focus:outline-none focus:border-blue-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-sm uppercase tracking-widest rounded-sm transition duration-150 active:scale-[0.99]"
            >
              Register Identity
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center">
          <p className="text-sm text-slate-400">
            Identity established?{" "}
            <Link
              to="/login"
              className="text-blue-500 hover:underline font-mono font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
