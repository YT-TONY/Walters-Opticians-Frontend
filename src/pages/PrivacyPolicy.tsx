// src/pages/PrivacyPolicy.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Mail } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-white text-walters-charcoal font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="w-full bg-walters-navy text-white py-6 px-8 sm:px-16 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-walters-gold hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
        <span className="font-serif tracking-[0.25em] text-white text-xs font-bold uppercase">
          WALTERS OPTICIANS
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 sm:py-16 space-y-10">
        <div className="space-y-3 text-center sm:text-left border-b border-walters-border pb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-walters-border rounded-full text-xs font-semibold text-walters-navy">
            <ShieldCheck className="w-4 h-4 text-walters-gold" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-walters-navy tracking-tight">
            Privacy Policy
          </h1>
          <p className="font-sans text-xs text-walters-slate">
            Last Updated: September 2026 • Effective Immediately
          </p>
        </div>

        <section className="space-y-8 text-sm leading-relaxed text-walters-slate">
          {/* Section 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-walters-border shadow-sm space-y-3">
            <div className="flex items-center space-x-3 text-walters-navy">
              <Eye className="w-5 h-5 text-walters-gold" />
              <h2 className="font-serif text-xl font-medium">1. Information We Collect</h2>
            </div>
            <p>
              At <strong>Walters Opticians</strong>, we handle your personal data with extreme care. When you create an account, purchase frames, or schedule appointment consultations, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs">
              <li><strong>Personal Identifiers:</strong> Full name, email address, phone number, and delivery address.</li>
              <li><strong>Optical Data:</strong> Prescription details, pupillary distance (PD), and lens customization preferences.</li>
              <li><strong>Social Authentication Data:</strong> Account tokens and email information provided when logging in via Google or Facebook.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-walters-border shadow-sm space-y-3">
            <div className="flex items-center space-x-3 text-walters-navy">
              <Lock className="w-5 h-5 text-walters-gold" />
              <h2 className="font-serif text-xl font-medium">2. How We Use Your Information</h2>
            </div>
            <p>
              Your information is exclusively utilized to deliver optical services and fulfill eyewear orders:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs">
              <li>To manufacture hand-finished frames and edge lenses specifically to your prescription.</li>
              <li>To dispatch order tracking links and essential account notification emails.</li>
              <li>To authenticate user sessions securely across web applications.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-walters-border shadow-sm space-y-3">
            <div className="flex items-center space-x-3 text-walters-navy">
              <FileText className="w-5 h-5 text-walters-gold" />
              <h2 className="font-serif text-xl font-medium">3. Data Sharing & Third Parties</h2>
            </div>
            <p>
              We do not sell, rent, or monetize your personal or optical data. Data is shared strictly with trusted operational providers required for core service delivery:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs">
              <li><strong>Delivery Partners:</strong> Courier services for physical frame delivery.</li>
              <li><strong>OAuth Identity Providers:</strong> Google and Meta (Facebook) for authorized user authentication.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-walters-border shadow-sm space-y-3">
            <div className="flex items-center space-x-3 text-walters-navy">
              <Mail className="w-5 h-5 text-walters-gold" />
              <h2 className="font-serif text-xl font-medium">4. Contact & Account Removal</h2>
            </div>
            <p>
              You have full control over your personal information. You can request account deactivation, data export, or deletion at any time by contacting our support team:
            </p>
            <p className="text-xs font-semibold text-walters-navy">
              Email: privacy@waltersopticians.com
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-walters-navy text-white/70 py-8 px-6 text-center text-xs font-sans mt-auto">
        <p>© 2026 Walters Opticians. Hand-finished frames & workshop precision.</p>
      </footer>
    </div>
  );
};