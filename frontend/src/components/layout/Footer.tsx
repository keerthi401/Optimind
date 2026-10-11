import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900">OptiMind AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              "See It, Understand It, Master It."
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Empowering students and lifelong learners with visual simulations, document-grounded AI explanations, and personalized mastery roadmaps.
            </p>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Learning Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard/explainer" className="hover:text-brand-600 transition-colors">
                  AI Concept Explainer
                </Link>
              </li>
              <li>
                <Link to="/dashboard/visuals" className="hover:text-brand-600 transition-colors">
                  Visual Learning Engine
                </Link>
              </li>
              <li>
                <Link to="/dashboard/documents" className="hover:text-brand-600 transition-colors">
                  Document RAG Assistant
                </Link>
              </li>
              <li>
                <Link to="/dashboard/quizzes" className="hover:text-brand-600 transition-colors">
                  Interactive Assessments
                </Link>
              </li>
              <li>
                <Link to="/dashboard/roadmap" className="hover:text-brand-600 transition-colors">
                  Personalized Study Roadmaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              Privacy & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-600">
                <Lock className="w-3 h-3 text-emerald-600" />
                Private document isolation
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <Cpu className="w-3 h-3 text-accent-600" />
                Transparent AI attribution
              </li>
              <li className="text-slate-500">
                No third-party training on uploaded study files
              </li>
              <li className="text-slate-500">
                Server-side credential protection
              </li>
            </ul>
          </div>

          {/* System Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Product Standard
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              OptiMind AI is built strictly with verifiable, functional learning software. Every metric, citation, and visual state reflects true computed logic.
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-mono text-slate-600">
                Phase 1: React Design System & Layout
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OptiMind AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 transition-colors">Privacy Notice</span>
            <span>•</span>
            <span className="hover:text-slate-600 transition-colors">Terms of Educational Use</span>
            <span>•</span>
            <span className="hover:text-slate-600 transition-colors">Accessibility Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
