import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, Layers, User } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { label: 'Capabilities', href: '#features' },
    { label: 'Visual Studio', href: '#visual-engine' },
    { label: 'Learning Workflow', href: '#workflow' },
    { label: 'Supported Materials', href: '#materials' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-500 text-white shadow-sm shadow-brand-500/20 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              OptiMind <span className="text-brand-600 font-extrabold">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide -mt-1 hidden sm:block">
              See It, Understand It, Master It
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </nav>

        {/* Actions (Sign In & Start Learning or Profile) */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-700">
                {user.name}
              </span>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Go to Workspace
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Start Learning
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link to="/dashboard">
            <Button variant="primary" size="sm">
              Start
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-6 sm:hidden animate-fadeIn">
          <nav className="flex flex-col gap-3 py-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-brand-600"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Go to Student Dashboard
            </Link>
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700">
                  <User className="w-4 h-4 text-brand-600" />
                  Signed in as {user.name}
                </div>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Create Free Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
