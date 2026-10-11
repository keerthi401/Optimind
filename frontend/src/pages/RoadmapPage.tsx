import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { PersonalizedRoadmap } from '../types';

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState('Master Distributed Systems & Consensus Algorithms');
  const [subject, setSubject] = useState('Computer Science');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [hoursPerWeek, setHoursPerWeek] = useState(6);
  const [targetDurationWeeks, setTargetDurationWeeks] = useState(4);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap | null>(null);

  const fetchCurrentRoadmap = async () => {
    try {
      const res = await api.roadmaps.getCurrent();
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (e: any) {
      console.warn('[Fetch Roadmap Warning]', e.message);
    }
  };

  useEffect(() => {
    fetchCurrentRoadmap();
  }, [user?.id]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await api.roadmaps.generate({
        goal: goal.trim(),
        subject,
        skillLevel,
        hoursPerWeek,
        targetDurationWeeks,
      });

      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Could not generate learning roadmap.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    if (!roadmap) return;
    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';

    setIsUpdating(true);
    try {
      const res = await api.roadmaps.updateMilestone(roadmap.id, milestoneId, newStatus);
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update milestone status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="brand" size="sm">
            Module 07
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            Personalized Curriculum Architect & Milestone Tracking
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Adaptive Study Roadmaps
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Build structured, sequenced study plans aligned with your schedule, prior knowledge, and target mastery deadlines.
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Roadmap Configuration Card */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <Input
              label="What is your primary educational goal or exam objective?"
              placeholder="e.g. Master Operating System Concurrency and Virtual Memory"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Select
                label="Domain"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                options={[
                  { label: 'Computer Science', value: 'Computer Science' },
                  { label: 'Algorithms', value: 'Algorithms' },
                  { label: 'Mathematics', value: 'Mathematics' },
                  { label: 'Physics', value: 'Physics' },
                  { label: 'General Engineering', value: 'General Engineering' },
                ]}
              />

              <Select
                label="Skill Level"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as any)}
                options={[
                  { label: 'Beginner', value: 'beginner' },
                  { label: 'Intermediate', value: 'intermediate' },
                  { label: 'Advanced', value: 'advanced' },
                ]}
              />

              <Input
                label="Hours / Week"
                type="number"
                min={1}
                max={40}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              />

              <Input
                label="Duration (Weeks)"
                type="number"
                min={1}
                max={52}
                value={targetDurationWeeks}
                onChange={(e) => setTargetDurationWeeks(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {roadmap ? 'Regenerate Learning Roadmap' : 'Generate Structured Roadmap'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Roadmap View */}
      {roadmap && (
        <div className="space-y-6">
          <Card className="border-brand-200 bg-gradient-to-br from-brand-50/30 via-white to-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Badge variant="brand" size="sm" className="mb-1">
                    Active Study Plan
                  </Badge>
                  <CardTitle className="text-xl text-slate-900">
                    {roadmap.goal}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                    <span>Level: {roadmap.skillLevel.toUpperCase()}</span>
                    <span>•</span>
                    <span>{roadmap.hoursPerWeek} hrs/week</span>
                    <span>•</span>
                    <span>{roadmap.targetDurationWeeks} Weeks total</span>
                  </div>
                </div>

                {/* Progress Circle & Status */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Curriculum Completion
                    </div>
                    <div className="text-xl font-extrabold text-brand-700">
                      {roadmap.overallProgress}%
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-brand-50 border-4 border-brand-500 flex items-center justify-center font-bold text-xs text-brand-700">
                    {roadmap.overallProgress}%
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {roadmap.milestones.map((ms, idx) => {
                  const isDone = ms.status === 'completed';

                  return (
                    <div key={ms.id} className="relative group">
                      {/* Checkbox circle indicator on timeline */}
                      <button
                        type="button"
                        onClick={() => handleToggleMilestone(ms.id, ms.status)}
                        disabled={isUpdating}
                        className={`absolute -left-6 sm:-left-8 top-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center transition-all shadow-xs ${
                          isDone
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-white text-slate-400 border-2 border-slate-300 hover:border-brand-500'
                        }`}
                        title="Click to toggle milestone status"
                      >
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                        ) : (
                          <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                        )}
                      </button>

                      {/* Milestone Card */}
                      <div
                        className={`rounded-xl border p-4 transition-all ${
                          isDone
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-slate-200 bg-white hover:border-brand-300'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h4 className={`text-sm font-bold ${isDone ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                            {ms.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              ~{ms.estimatedHours} hrs
                            </span>
                            <Badge
                              variant={isDone ? 'success' : ms.status === 'in_progress' ? 'brand' : 'neutral'}
                              size="sm"
                            >
                              {isDone ? 'Completed' : ms.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                            </Badge>
                          </div>
                        </div>

                        {/* Topics Pill List */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ms.topics.map((t, ti) => (
                            <span
                              key={ti}
                              className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                                isDone
                                  ? 'bg-emerald-100/70 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
