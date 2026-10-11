import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Eye,
  FileText,
  HelpCircle,
  ArrowRight,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [savedExplanations, setSavedExplanations] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    api.progress.getSummary()
      .then((res) => {
        if (isMounted && res.success) {
          setProgressData(res.data);
        }
      })
      .catch(() => {});

    api.ai.getSaved()
      .then((res) => {
        if (isMounted && res.success) {
          setSavedExplanations(res.data || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const displayName = user?.name || 'Student Learner';
  const metrics = progressData?.metrics;
  const activeRoadmap = progressData?.activeRoadmap;
  const recentAttempts = progressData?.recentAttempts || [];
  const weakTopics = progressData?.weakTopics || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-brand-200/90 bg-gradient-to-r from-brand-600 via-brand-700 to-accent-600 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OptiMind AI Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-brand-100 font-normal leading-relaxed">
            "See It, Understand It, Master It." Your visual educational workspace is ready. Jump into interactive simulations, ask grounded document questions, or evaluate your mastery.
          </p>
        </div>

        {/* Ambient background blur */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Highlights */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Study Hours</div>
            <div className="text-lg font-bold text-slate-900">{metrics.totalHoursStudied || 0} hrs</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Streak</div>
            <div className="text-lg font-bold text-amber-600">{metrics.learningStreakDays || 1} Days</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Avg Quiz Score</div>
            <div className="text-lg font-bold text-emerald-600">{metrics.averageQuizScore || 0}%</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Saved Lessons</div>
            <div className="text-lg font-bold text-brand-600">{savedExplanations.length}</div>
          </div>
        </div>
      )}

      {/* Quick Action Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/dashboard/explainer" className="group">
          <Card interactive className="h-full border-slate-200 hover:border-brand-400">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Explain Concept</h4>
                <p className="text-xs text-slate-500">Deconstruct any complex topic</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/visuals" className="group">
          <Card interactive className="h-full border-slate-200 hover:border-accent-400">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Visual Studio</h4>
                <p className="text-xs text-slate-500">Interactive step-by-step simulations</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/documents" className="group">
          <Card interactive className="h-full border-slate-200 hover:border-brand-400">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Document RAG</h4>
                <p className="text-xs text-slate-500">Grounded notes & textbook Q&A</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/quizzes" className="group">
          <Card interactive className="h-full border-slate-200 hover:border-purple-400">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Diagnostic Quizzes</h4>
                <p className="text-xs text-slate-500">Server-graded assessments</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Roadmap Progress & Diagnostic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Study Plan or Onboarding Callout */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div>
                <Badge variant="brand" size="sm" className="mb-1">
                  Active Study Plan
                </Badge>
                <CardTitle className="text-base text-slate-900">
                  {activeRoadmap ? activeRoadmap.goal : 'No active study roadmap yet'}
                </CardTitle>
              </div>
              <Link to="/dashboard/roadmap">
                <Button variant="outline" size="sm" className="text-xs">
                  {activeRoadmap ? 'View Full Roadmap' : 'Create Roadmap'}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {activeRoadmap ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Curriculum Completion Progress</span>
                    <span className="font-mono text-brand-700">{activeRoadmap.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60">
                    <div
                      className="bg-brand-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeRoadmap.overallProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>
                      {activeRoadmap.completedMilestones} of {activeRoadmap.totalMilestones} Milestones Completed
                    </span>
                    <Link to="/dashboard/roadmap" className="text-brand-600 font-semibold hover:underline flex items-center gap-1">
                      Continue Learning <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                  <p>Generate a structured study roadmap tailored to your target hours and difficulty level.</p>
                  <Link to="/dashboard/roadmap">
                    <Button variant="primary" size="sm">
                      Create Personalized Study Plan
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Explanations & Lessons */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800">
                Saved Concepts & Lessons
              </CardTitle>
              <Link to="/dashboard/explainer">
                <Button variant="ghost" size="sm" className="text-xs">
                  Explore More
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {savedExplanations.length > 0 ? (
                <div className="space-y-2.5">
                  {savedExplanations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-xs flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{item.topic}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.summary}</span>
                      </div>
                      <Badge variant="accent" size="sm">
                        {item.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No saved lessons yet. Save explanations in the AI Explainer to review them here!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Assessment Performance & Telemetry */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-600" />
                Verified Assessment Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {recentAttempts.length > 0 ? (
                recentAttempts.slice(0, 4).map((att: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs"
                  >
                    <span className="font-medium text-slate-700 truncate max-w-[65%]">{att.title}</span>
                    <span className="font-mono font-bold text-brand-700">{att.percentage}%</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Take a diagnostic quiz to generate verified scores.
                </div>
              )}

              <Link to="/dashboard/quizzes" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Take Diagnostic Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Diagnosed Weak Areas */}
          {weakTopics.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Identified Weak Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.map((wt: string, idx: number) => (
                    <Badge key={idx} variant="warning" size="sm">
                      {wt}
                    </Badge>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Derived from incorrect answers in diagnostic quizzes.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
