import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle,
  Eye,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MermaidDiagram } from '../common/MermaidDiagram';
import { DEMO_BINARY_SEARCH_LESSON } from '../../utils/sampleData';
import { useSpeechSynthesis } from '../../utils/useSpeechSynthesis';
import type { InteractiveVisualLesson } from '../../types';

interface InteractiveConceptVisualizerProps {
  embedded?: boolean;
  lesson?: InteractiveVisualLesson;
  narrationEnabled?: boolean;
  onToggleNarration?: () => void;
}

export const InteractiveConceptVisualizer: React.FC<InteractiveConceptVisualizerProps> = ({
  embedded = false,
  lesson = DEMO_BINARY_SEARCH_LESSON,
  narrationEnabled = false,
  onToggleNarration,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2000);
  const timerRef = useRef<number | null>(null);

  const { speak, stop: stopSpeech, isSupported: isTtsSupported } = useSpeechSynthesis();

  // Reset to step 0 if lesson changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [lesson.id]);

  const step = lesson.steps[currentStepIndex] || lesson.steps[0];
  const totalSteps = lesson.steps.length;

  // Speak step when narration is enabled
  useEffect(() => {
    if (narrationEnabled && step) {
      speak(`${step.title}. ${step.explanation}. Takeaway: ${step.keyTakeaway}`);
    } else {
      stopSpeech();
    }
  }, [currentStepIndex, narrationEnabled, step]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setTimeout(() => {
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    stopSpeech();
  };

  const togglePlay = () => {
    if (currentStepIndex === totalSteps - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden transition-all ${
        embedded ? 'p-4 sm:p-6' : 'p-6 sm:p-8'
      }`}
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand" size="sm">
              Visual Learning Engine
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              Interactive State Simulation
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{lesson.title}</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
              {lesson.difficulty}
            </span>
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">{lesson.overview}</p>
        </div>

        {/* Step Progress Indicator & TTS Button */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          {onToggleNarration && isTtsSupported && (
            <Button
              variant={narrationEnabled ? 'danger' : 'outline'}
              size="sm"
              onClick={onToggleNarration}
              leftIcon={narrationEnabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            >
              {narrationEnabled ? 'Mute Audio' : 'Audio Narration'}
            </Button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Stage {currentStepIndex + 1} of {totalSteps}
            </span>
            <div className="flex gap-1.5" role="tablist" aria-label="Lesson Stages">
              {lesson.steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    idx === currentStepIndex
                      ? 'w-7 bg-brand-600'
                      : idx < currentStepIndex
                      ? 'w-2.5 bg-brand-300'
                      : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Jump to stage ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="py-6">
        {/* Dynamic Concept Canvas */}
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-white shadow-inner relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-6 border-b border-slate-800 pb-3">
              <span className="font-mono flex items-center gap-1.5 text-brand-300">
                <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                Active Visual Invariant Tracker
              </span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Live State Progression
              </span>
            </div>

            {/* If values array exists, render memory buffer blocks */}
            {step?.visualState?.values && step.visualState.values.length > 0 && (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-xs text-slate-400 mb-3 font-medium">
                  State Memory Buffer & Indices
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-full">
                  {step.visualState.values.map((val, idx) => {
                    const isHighlighted =
                      step.visualState?.highlightIndices?.includes(idx);
                    const isPointer = step.visualState?.pointerIndex === idx;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center transition-all duration-300"
                      >
                        <div className="h-6 flex items-center justify-center">
                          {isPointer && (
                            <div className="animate-bounce text-[10px] font-mono font-bold text-accent-300 bg-accent-950/80 px-2 py-0.5 rounded border border-accent-500/50">
                              PTR
                            </div>
                          )}
                        </div>

                        <div
                          className={`w-11 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center text-base sm:text-lg font-bold font-mono transition-all duration-300 shadow-md ${
                            isPointer
                              ? 'bg-brand-600 text-white scale-105 ring-2 ring-brand-400 shadow-brand-500/20'
                              : isHighlighted
                              ? 'bg-emerald-600 text-white border border-emerald-400'
                              : 'bg-slate-800 text-brand-100 border border-slate-700'
                          }`}
                        >
                          {val}
                        </div>

                        <span
                          className={`mt-1.5 text-[11px] font-mono ${
                            isPointer ? 'text-accent-300 font-bold' : 'text-slate-500'
                          }`}
                        >
                          [{idx}]
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If Mermaid diagram definition is provided, render the diagram */}
            {step?.mermaidDiagram && (
              <div className="my-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  Structural Diagram (Mermaid.js)
                </div>
                <MermaidDiagram chart={step.mermaidDiagram} className="text-slate-200" />
              </div>
            )}

            {/* Status Message Terminal Banner */}
            {step?.visualState?.statusMessage && (
              <div className="mt-6 w-full max-w-2xl mx-auto rounded-lg bg-slate-950/90 border border-slate-800 p-3.5 text-xs font-mono text-slate-300 flex items-start gap-2.5">
                <span className="text-brand-400 font-bold select-none">&gt;</span>
                <p className="leading-relaxed">
                  {step.visualState.statusMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step Explanation & Insights */}
        {step && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                <Eye className="w-4 h-4 text-brand-600" />
                Step {step.stepNumber}: {step.title}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {step.explanation}
              </p>
            </div>

            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 uppercase tracking-wider mb-1">
                <Info className="w-3.5 h-3.5 text-brand-700" />
                Key Invariant
              </div>
              <p className="text-xs text-brand-800 font-medium leading-relaxed">
                {step.keyTakeaway}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={togglePlay}
            leftIcon={
              isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )
            }
          >
            {isPlaying ? 'Pause' : currentStepIndex === totalSteps - 1 ? 'Replay' : 'Play Simulation'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentStepIndex === totalSteps - 1}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
        </div>

        {/* Speed Adjustment Controls */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span>Speed:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            {[
              { label: '1x', delay: 2500 },
              { label: '1.5x', delay: 1800 },
              { label: '2x', delay: 1000 },
            ].map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => setPlaybackSpeed(sp.delay)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  playbackSpeed === sp.delay
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveConceptVisualizer;
