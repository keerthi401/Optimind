import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  CheckCircle,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    metrics: {
      totalHoursStudied: number;
      learningStreakDays: number;
      completedLessonsCount: number;
      averageQuizScore: number;
      totalQuizzesTaken: number;
      documentsIngestedCount: number;
    };
    activeRoadmap: {
      id: string;
      goal: string;
      overallProgress: number;
      totalMilestones: number;
      completedMilestones: number;
    } | null;
    weakTopics: string[];
    revisionRecommendations: {
      topic: string;
      reason: string;
      action: string;
    }[];
    recentAttempts: {
      id: string;
      title: string;
      score: number;
      totalQuestions: number;
      percentage: number;
      completedAt: string;
    }[];
    recentActivities: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const res = await api.progress.getSummary();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e: any) {
      console.warn('[Fetch Progress Summary Error]', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-slate-500">
        Loading verified learning analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="brand" size="sm">
            Module 08
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            Verified Learning Analytics & Mastery Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Learning Progress & Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real telemetry derived from your actual diagnostic assessments, study sessions, and milestone completions.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5 border-slate-200">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Verified Study Time</div>
            <div className="text-xl font-extrabold text-slate-900">
              {data?.metrics.totalHoursStudied || 0} hrs
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border-slate-200">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Learning Streak</div>
            <div className="text-xl font-extrabold text-slate-900">
              {data?.metrics.learningStreakDays || 1} Days
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border-slate-200">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Average Assessment</div>
            <div className="text-xl font-extrabold text-slate-900">
              {data?.metrics.averageQuizScore || 0}%
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border-slate-200">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Completed Milestones</div>
            <div className="text-xl font-extrabold text-slate-900">
              {data?.metrics.completedLessonsCount || 0}
            </div>
          </div>
        </Card>
      </div>

      {/* Weak Topics & Revision Recommendations */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Diagnosed Knowledge Gaps & Targeted Revision Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.revisionRecommendations && data.revisionRecommendations.length > 0 ? (
            <div className="space-y-3">
              {data.revisionRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-amber-200/80 text-xs shadow-2xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-amber-900 font-mono text-[11px] block">
                      Gap: {rec.topic}
                    </span>
                    <span className="text-slate-600 block">
                      {rec.action}
                    </span>
                  </div>
                  <Link to="/dashboard/explainer">
                    <Button variant="outline" size="sm" className="text-xs shrink-0">
                      Revisit in Explainer
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-xs text-slate-500 text-center">
              No knowledge gaps detected yet. Take assessments in the Quiz module to evaluate your understanding!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment History */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">
              Verified Quiz Performance Log
            </CardTitle>
            <Link to="/dashboard/quizzes">
              <Button variant="ghost" size="sm" className="text-xs">
                Take New Assessment
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {data?.recentAttempts && data.recentAttempts.length > 0 ? (
            data.recentAttempts.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">{att.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Completed: {new Date(att.completedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold font-mono text-brand-700">
                    {att.score} / {att.totalQuestions} ({att.percentage}%)
                  </div>
                  <Badge variant={att.percentage >= 75 ? 'success' : 'warning'} size="sm">
                    {att.percentage >= 75 ? 'Mastery Verified' : 'Needs Review'}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No assessment attempts recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressPage;
