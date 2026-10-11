import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Eye,
  FileText,
  HelpCircle,
  Compass,
  BarChart3,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { api, type HealthCheckData } from '../../services/api';

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onCloseMobile }) => {
  const [backendStatus, setBackendStatus] = useState<{
    connected: boolean;
    data?: HealthCheckData;
  }>({ connected: false });

  useEffect(() => {
    let isMounted = true;
    api.checkHealth()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setBackendStatus({ connected: true, data: res.data });
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendStatus({ connected: false });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navigationItems = [
    {
      name: 'Overview',
      to: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'AI Explainer',
      to: '/dashboard/explainer',
      icon: Sparkles,
      badge: 'Core',
    },
    {
      name: 'Visual Studio',
      to: '/dashboard/visuals',
      icon: Eye,
      badge: 'Visual',
    },
    {
      name: 'Document Library',
      to: '/dashboard/documents',
      icon: FileText,
      badge: 'RAG',
    },
    {
      name: 'Assessments',
      to: '/dashboard/quizzes',
      icon: HelpCircle,
    },
    {
      name: 'Study Roadmap',
      to: '/dashboard/roadmap',
      icon: Compass,
    },
    {
      name: 'Progress & Analytics',
      to: '/dashboard/progress',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/90 bg-white">
      {/* Brand Title */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-500 text-white shadow-sm shadow-brand-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">
            OptiMind <span className="text-brand-600">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Student Workspace
          </span>
        </div>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Learning Modules
        </div>
        <nav className="space-y-1" aria-label="Student Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs ring-1 ring-brand-200/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold',
                            isActive
                              ? 'bg-brand-200/60 text-brand-800'
                              : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="h-3 w-3 text-brand-600" />
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Environment Status Notice & Logout */}
      <div className="border-t border-slate-100 p-4 space-y-3">
        <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            Environment Status
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                backendStatus.connected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'
              )}
            />
            <span className="font-medium text-slate-700">
              {backendStatus.connected ? 'Backend API Active' : 'Connecting to API...'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {backendStatus.connected
              ? `v${backendStatus.data?.version || '1.0.0'} (${backendStatus.data?.environment || 'development'})`
              : 'Express REST API on Port 5000'}
          </div>
        </div>

        <NavLink
          to="/login"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          <span>Exit Workspace</span>
        </NavLink>
      </div>
    </aside>
  );
};
