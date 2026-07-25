import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center px-6 py-12 max-w-md mx-auto bg-slate-950 text-white">
            <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 text-indigo-400">
                    <LogIn className="w-8 h-8" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-2">Welcome Back</h2>
                <p className="text-slate-400 text-sm sm:text-base">Sign in to start collaborating and calling</p>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 text-center font-medium text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-slate-300 font-bold text-sm mb-2">Email Address</label>
                    <input
                        type="email"
                        required
                        placeholder="developer@example.com"
                        className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-slate-300 font-bold text-sm mb-2">Password</label>
                    <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition duration-200 mt-2 active:scale-[0.99]"
                >
                    Sign In
                </button>
            </form>

            <p className="text-center text-slate-400 mt-8 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-400 hover:underline font-bold">
                    Create account
                </Link>
            </p>
        </div>
    );
};

export default Login;