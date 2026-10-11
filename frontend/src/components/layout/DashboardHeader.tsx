import React from 'react';
import { Menu, Sparkles, LogOut, Flame } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
  onOpenMobileSidebar: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenMobileSidebar,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.name || 'Student Learner';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Mobile Drawer Trigger & Workspace Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="brand" size="sm">
            OptiMind AI
          </Badge>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500 font-medium">
            Production Workspace
          </span>
        </div>
      </div>

      {/* Center / Right actions */}
      <div className="flex items-center gap-3">
        {/* Streak Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{user?.learningStreakDays || 1} Day Streak</span>
        </div>

        {/* Quick Explainer Action */}
        <Link to="/dashboard/explainer">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Ask AI Concept
          </Button>
        </Link>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 py-1 pl-1 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-xs">
            {initial}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-none">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
              {user?.isGuest ? 'Guest Session' : 'Verified Learner'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
