import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF5] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[#E5E0D8]">
        <h2 className="font-serif text-2xl font-bold text-[#021438] mb-1">Welcome Back</h2>
        <p className="text-xs text-[#5E6470] mb-6">Sign in to access your saved frames and prescription history.</p>

        {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5E6470] uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5E6470] absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E5E0D8] rounded-xl bg-[#FBFAF5] text-sm focus:outline-none focus:border-[#021438]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5E6470] uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5E6470] absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E5E0D8] rounded-xl bg-[#FBFAF5] text-sm focus:outline-none focus:border-[#021438]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#021438] text-[#FBFAF5] font-bold rounded-xl hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center justify-center space-x-2 text-xs"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-[#5E6470] mt-6 text-center">
          Don't have an account? <Link to="/register" className="text-[#021438] font-bold underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};