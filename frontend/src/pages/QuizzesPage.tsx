import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const QuizzesPage: React.FC = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('Dynamic Memory Allocation & Pointers in C');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<{
    id: string;
    title: string;
    totalQuestions: number;
    questions: {
      id: string;
      question: string;
      options: string[];
      topic: string;
    }[];
  } | null>({
    id: 'sample_quiz_01',
    title: 'Dynamic Memory Allocation & Pointers Diagnostic',
    totalQuestions: 1,
    questions: [
      {
        id: 'q1',
        question: 'What occurs when dynamic memory allocated with malloc() is never passed to free() before program termination?',
        options: [
          'Stack overflow exception is triggered',
          'A memory leak occurs, retaining unusable heap space',
          'The compiler automatically injects deallocation logic',
          'Segmentation fault occurs immediately upon function return',
        ],
        topic: 'Memory Leaks',
      },
    ],
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [evaluation, setEvaluation] = useState<{
    attemptId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    weakTopics: string[];
    questionResults: {
      questionId: string;
      question: string;
      selectedOptionIndex: number;
      correctOptionIndex: number;
      isCorrect: boolean;
      explanation: string;
      topic: string;
    }[];
  } | null>(null);

  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  const fetchAttempts = async () => {
    try {
      const res = await api.quizzes.getRecentAttempts();
      if (res.success && Array.isArray(res.data)) {
        setRecentAttempts(res.data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [user?.id]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setError(null);
    setIsGenerating(true);
    setEvaluation(null);
    setSelectedAnswers({});

    try {
      const res = await api.quizzes.generate({
        topic: topic.trim(),
        difficulty,
      });

      if (res.success && res.data) {
        setActiveQuiz(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate diagnostic quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
    if (evaluation) return; // Prevent changing after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setError(null);

    // Prepare array of answers corresponding to questions
    const answersArray = activeQuiz.questions.map((_, idx) =>
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    );

    setIsSubmitting(true);
    try {
      const res = await api.quizzes.submit(activeQuiz.id, answersArray);
      if (res.success && res.data) {
        setEvaluation(res.data);
        await fetchAttempts();
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setEvaluation(null);
    setSelectedAnswers({});
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="brand" size="sm">
            Module 06
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            Diagnostic Assessments & Server-Side Evaluation
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Adaptive Assessments & Quizzes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Evaluate understanding, detect cognitive misconceptions, and receive targeted revision recommendations.
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Quiz Generation Card */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Generate Diagnostic Quiz on Topic"
                  placeholder="e.g. Graph Traversals, Binary Trees, CPU Scheduling"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>
              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                options={[
                  { label: 'Beginner', value: 'beginner' },
                  { label: 'Intermediate', value: 'intermediate' },
                  { label: 'Advanced', value: 'advanced' },
                ]}
              />
            </div>
            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isGenerating}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Diagnostic Assessment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Quiz Card */}
      {activeQuiz && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge variant="accent" size="sm" className="mb-1">
                    {activeQuiz.questions.length} Questions
                  </Badge>
                  <CardTitle className="text-xl text-slate-900">
                    {activeQuiz.title}
                  </CardTitle>
                </div>

                {evaluation && (
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <Award className="w-6 h-6 text-brand-600" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Score: {evaluation.score} / {evaluation.totalQuestions} ({evaluation.percentage}%)
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Verified by server evaluation engine
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-8">
              {activeQuiz.questions.map((q, qIndex) => {
                const evalItem = evaluation?.questionResults?.[qIndex];

                return (
                  <div key={q.id || qIndex} className="space-y-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        {qIndex + 1}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {q.question}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                          Topic: {q.topic}
                        </span>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pl-9">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = selectedAnswers[qIndex] === optIndex;
                        let optionStyle =
                          'border-slate-200 bg-white hover:border-brand-400 text-slate-700';

                        if (evaluation && evalItem) {
                          if (optIndex === evalItem.correctOptionIndex) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                          } else if (isSelected && !evalItem.isCorrect) {
                            optionStyle = 'border-red-500 bg-red-50 text-red-900 line-through';
                          } else {
                            optionStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-brand-600 bg-brand-50 text-brand-900 font-semibold shadow-xs';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            disabled={Boolean(evaluation)}
                            onClick={() => handleOptionSelect(qIndex, optIndex)}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${optionStyle}`}
                          >
                            <span className="font-mono text-slate-400 font-bold shrink-0">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Result Explanation after Submission */}
                    {evalItem && (
                      <div
                        className={`ml-9 mt-3 p-3.5 rounded-xl border text-xs space-y-1 ${
                          evalItem.isCorrect
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : 'bg-red-50/70 border-red-200 text-red-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          {evalItem.isCorrect ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>Correct!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span>Mistake Identified</span>
                            </>
                          )}
                        </div>
                        <p className="leading-relaxed text-slate-700 font-normal">
                          {evalItem.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                {evaluation ? (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleRetake}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Retake Assessment
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitQuiz}
                    isLoading={isSubmitting}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Submit Answers for Evaluation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Weak Areas & Recommendations */}
          {evaluation && evaluation.weakTopics.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  Targeted Revision Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-amber-900 mb-3">
                  Based on your missed questions, revisit the following topic areas in the AI Explainer or Visual Studio:
                </p>
                <div className="flex flex-wrap gap-2">
                  {evaluation.weakTopics.map((wt, i) => (
                    <Badge key={i} variant="warning" size="md">
                      {wt}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Attempts Log */}
      {recentAttempts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-800">
              Verified Assessment History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAttempts.map((att, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{att.title}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {new Date(att.createdAt || att.completedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-bold font-mono text-brand-700">
                  {att.score} / {att.totalQuestions} ({att.percentage}%)
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizzesPage;
