import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { X, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, token, isLoading, loginAsGuest } = useAuth();

  useEffect(() => {
    if (!isLoading && !token && !user) {
      loginAsGuest().catch((err) => console.warn('[Guest Init Error]', err));
    }
  }, [isLoading, token, user, loginAsGuest]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar (visible on lg and above) */}
      <div className="hidden lg:flex lg:shrink-0">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay & Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            <DashboardSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <DashboardHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {user?.isGuest && (
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2.5 text-xs text-brand-900 shadow-xs">
              <span className="font-medium">
                You are currently exploring OptiMind AI in <strong>Guest Mode</strong>.
              </span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1 font-semibold text-white hover:bg-brand-700 transition-colors w-fit"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Create Permanent Account
              </Link>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
