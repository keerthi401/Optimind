import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import api from '../services/api';

export const ExplainerPage: React.FC = () => {
  const [topic, setTopic] = useState('How does Dynamic Memory Allocation work in C?');
  const [subject, setSubject] = useState('computer_science');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [format, setFormat] = useState<'simple' | 'step_by_step' | 'analogy'>('step_by_step');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [responseMeta, setResponseMeta] = useState<{
    isLiveAi: boolean;
    provider: string;
    notice?: string;
  }>({
    isLiveAi: false,
    provider: 'educational_engine',
  });

  const [explanation, setExplanation] = useState<{
    summary: string;
    steps: { title: string; content: string }[];
    terminology: { term: string; definition: string }[];
    analogy: string;
  } | null>({
    summary:
      'Dynamic memory allocation allows a program to request memory from the operating system heap at runtime rather than at compile time.',
    steps: [
      {
        title: '1. The Heap vs The Stack',
        content:
          'Local variables live on the Stack (automatically cleaned up when functions return). Dynamic buffers live on the Heap (persists until manually freed).',
      },
      {
        title: '2. Requesting Memory with malloc()',
        content:
          'malloc(size_t bytes) asks the OS allocator for a contiguous block of heap bytes and returns a void pointer to the start address.',
      },
      {
        title: '3. Checking for Allocation Failure',
        content:
          'If the OS cannot satisfy the memory request, malloc returns NULL. Robust code must verify pointers before dereferencing.',
      },
      {
        title: '4. Releasing Memory with free()',
        content:
          'Heap memory must be explicitly released using free(ptr). Forgetting to free leads to memory leaks; freeing twice causes undefined behavior.',
      },
    ],
    terminology: [
      {
        term: 'Heap',
        definition: 'A region of memory reserved for dynamic allocation during runtime.',
      },
      {
        term: 'Dangling Pointer',
        definition: 'A pointer referencing memory that has already been deallocated.',
      },
      {
        term: 'Memory Leak',
        definition: 'Failure to deallocate memory that is no longer needed.',
      },
    ],
    analogy:
      'Think of dynamic memory like renting a storage unit. You request the exact square footage you need, store your items, and must return the keys (free) when you leave so others can use it.',
  });

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setError(null);
    setIsLoading(true);
    setIsSaved(false);

    try {
      const res = await api.ai.explain({
        topic: topic.trim(),
        subject,
        difficulty,
        format,
      });

      if (res.success && res.data) {
        setExplanation(res.data.data);
        setResponseMeta({
          isLiveAi: res.data.isLiveAi,
          provider: res.data.provider,
          notice: res.data.notice,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!explanation) return;
    try {
      await api.ai.saveExplanation({
        topic,
        subject,
        difficulty,
        format,
        ...explanation,
      });
      setIsSaved(true);
    } catch (err: any) {
      setError(err.message || 'Could not save explanation.');
    }
  };

  const handleCopy = () => {
    if (explanation) {
      const formattedText = `# ${topic}\n\n${explanation.summary}\n\n## Steps\n${explanation.steps
        .map((s) => `### ${s.title}\n${s.content}`)
        .join('\n\n')}\n\n## Analogy\n${explanation.analogy}`;
      navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="brand" size="sm">
            Module 01
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            {responseMeta.isLiveAi ? '✨ Live Gemini Engine' : '⚡ Structured Educational Engine'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Concept Explainer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Deconstruct challenging technical concepts into grounded step-by-step cognitive models, definitions, and mental analogies.
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {responseMeta.notice && (
        <Alert variant="info">
          {responseMeta.notice}
        </Alert>
      )}

      {/* Input Configuration Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleExplain} className="space-y-4">
            <Input
              label="What concept, algorithm, or theorem would you like to master?"
              placeholder="e.g. How does Paxos or Raft achieve distributed consensus?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Subject Domain"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                options={[
                  { label: 'Computer Science', value: 'computer_science' },
                  { label: 'Algorithms & Data Structures', value: 'algorithms' },
                  { label: 'Mathematics', value: 'mathematics' },
                  { label: 'Operating Systems & Networks', value: 'networking' },
                  { label: 'Physics & Science', value: 'physics' },
                  { label: 'General Engineering', value: 'general' },
                ]}
              />

              <Select
                label="Target Comprehension Depth"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                options={[
                  { label: 'Beginner (Intuitive Overview)', value: 'beginner' },
                  { label: 'Intermediate (Undergraduate Core)', value: 'intermediate' },
                  { label: 'Advanced (Mathematical Rigor)', value: 'advanced' },
                ]}
              />

              <Select
                label="Pedagogical Format"
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                options={[
                  { label: 'Step-by-Step Deconstruction', value: 'step_by_step' },
                  { label: 'Simple High-Level Summary', value: 'simple' },
                  { label: 'Analogy & Real-World Parallel', value: 'analogy' },
                ]}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Structured Explanation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Generated Explanation Result */}
      {explanation && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <Card className="border-brand-200 bg-gradient-to-br from-brand-50/40 via-white to-white">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <Badge variant="accent" size="sm" className="mb-2">
                  Executive Concept Synthesis
                </Badge>
                <CardTitle className="text-xl text-slate-900">
                  {topic}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaved}
                  leftIcon={isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                >
                  {isSaved ? 'Saved to Workspace' : 'Save Lesson'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                {explanation.summary}
              </p>
            </CardContent>
          </Card>

          {/* Sequential Step Progression */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Structural Deconstruction
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {explanation.steps.map((st, idx) => (
                <Card key={idx} className="hover:border-brand-300 transition-all shadow-xs">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      {st.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {st.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Analogy & Terminology Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mental Analogy */}
            <Card className="border-amber-200/80 bg-amber-50/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-amber-950">
                    Intuitive Mental Analogy
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed italic">
                  "{explanation.analogy}"
                </p>
              </CardContent>
            </Card>

            {/* Core Terminology */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Critical Invariants & Terminology
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {explanation.terminology.map((termItem, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs font-bold font-mono text-brand-700 block">
                      {termItem.term}
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">
                      {termItem.definition}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainerPage;
