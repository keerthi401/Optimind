import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
        The requested educational module or resource could not be found.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<Home className="w-3.5 h-3.5" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            To Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
