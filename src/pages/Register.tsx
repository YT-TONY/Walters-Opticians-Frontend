// src/pages/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { WavyDivider } from '../components/wavyDivider';

interface ApiErrorResponse {
  response?: { data?: { detail?: string } };
}

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({ full_name: fullName, email, password });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      const errorMsg = error.response?.data?.detail || 'Registration failed.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-walters-cream text-walters-charcoal overflow-x-hidden font-sans">
      
      {/* LEFT PANEL */}
      <div className="relative w-full md:w-[38vw] bg-walters-navy text-white min-h-[45vh] md:min-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between shrink-0 z-20 shadow-2xl">
        
        <div className="relative z-10">
          <span className="font-sans tracking-[0.25em] text-white text-xs font-bold uppercase">
            WALTERS OPTICIANS
          </span>
        </div>

        <div className="my-auto py-12 relative z-10 space-y-6">
          <h1 className="font-serif text-4xl sm:text-4xl lg:text-6xl font-normal leading-[1.15] text-white tracking-normal">
            Handcrafted frames, <br />
            tailored for life.
          </h1>
        </div>

        <div className="relative z-10 space-y-1">
          <p className="font-serif tracking-[0.2em] text-white text-sm font-bold uppercase">
            WALTERS OPTICIANS
          </p>
          <p className="font-sans text-[11px] text-white/70 font-normal">
            Hand-finished frames, prescription lenses edged in our workshop.
          </p>
        </div>

        <WavyDivider />

      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-[62vw] bg-walters-cream flex items-center justify-center p-8 sm:p-16 lg:p-24 relative z-10 min-h-[55vh] md:min-h-screen">
        
        <div className="absolute top-1/3 right-12 w-md h-112 bg-walters-gold/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm mx-auto space-y-8 relative z-10">
          
          <div className="space-y-2">
            <h2 className="font-serif text-4xl font-normal text-walters-navy tracking-tight">
              Create account
            </h2>
            <p className="font-sans text-xs text-walters-slate">
              Join Walters Opticians for custom frames and express delivery.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 font-sans">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-walters-slate">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-walters-slate/60">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-walters-border rounded-lg text-walters-charcoal text-sm focus:outline-none focus:border-walters-navy focus:bg-white transition-all duration-200 placeholder:text-walters-slate/40 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-walters-slate">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-walters-slate/60">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-walters-border rounded-lg text-walters-charcoal text-sm focus:outline-none focus:border-walters-navy focus:bg-white transition-all duration-200 placeholder:text-walters-slate/40 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-walters-slate">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-walters-slate/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-walters-border rounded-lg text-walters-charcoal text-sm focus:outline-none focus:border-walters-navy focus:bg-white transition-all duration-200 placeholder:text-walters-slate/40 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-walters-navy text-white py-3.5 px-6 rounded-lg font-sans font-semibold text-xs tracking-wider uppercase hover:bg-walters-gold hover:text-walters-navy transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group disabled:opacity-50 active:scale-[0.99]"
            >
              <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </form>

          <div className="pt-4 text-center font-sans text-xs text-walters-slate border-t border-walters-border/60">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-walters-navy font-bold hover:text-walters-gold transition-colors underline">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};