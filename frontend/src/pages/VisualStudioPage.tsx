import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { InteractiveConceptVisualizer } from '../components/visualizer/InteractiveConceptVisualizer';
import { DEMO_BINARY_SEARCH_LESSON } from '../utils/sampleData';
import api from '../services/api';
import type { InteractiveVisualLesson } from '../types';

const BUBBLE_SORT_LESSON: InteractiveVisualLesson = {
  id: 'lesson_bubble_01',
  title: 'Bubble Sort Invariant Tracking',
  subject: 'algorithms',
  difficulty: 'beginner',
  overview: 'Watch adjacent element comparisons and swaps bubble the largest unsorted value to the high index in each pass.',
  interactiveControlsEnabled: true,
  steps: [
    {
      stepNumber: 1,
      title: 'Pass 1: Compare Adjacent Pair (Indices 0 & 1)',
      description: 'Examining values 64 and 34. Since 64 > 34, a swap is triggered.',
      explanation: 'Bubble sort traverses through the array comparing contiguous pairs. Whenever arr[j] > arr[j+1], values are swapped.',
      keyTakeaway: 'Local inversions are monotonically resolved pair by pair.',
      visualState: {
        values: [64, 34, 25, 12, 22, 11, 90],
        highlightIndices: [0, 1],
        pointerIndex: 0,
        statusMessage: 'Comparing index 0 (64) and index 1 (34). 64 > 34: Swapping positions.',
      },
      mermaidDiagram: `flowchart LR
  A["[0]: 64"] <--> B["[1]: 34"]
  B --> C["[2]: 25"] --> D["[3]: 12"]`,
    },
    {
      stepNumber: 2,
      title: 'Pass 1 Swapped: Advance Pointer to (Indices 1 & 2)',
      description: 'Array is now [34, 64, 25, 12, ...]. Next comparison: 64 vs 25.',
      explanation: 'The larger value (64) propagates upward like a bubble toward the end of the array.',
      keyTakeaway: 'The maximum unsorted element acts as the active bubble.',
      visualState: {
        values: [34, 64, 25, 12, 22, 11, 90],
        highlightIndices: [1, 2],
        pointerIndex: 1,
        statusMessage: 'Comparing index 1 (64) and index 2 (25). 64 > 25: Swapping positions.',
      },
      mermaidDiagram: `flowchart LR
  A["[0]: 34"] --> B["[1]: 64"] <--> C["[2]: 25"]`,
    },
    {
      stepNumber: 3,
      title: 'Pass 1 Complete: Largest Element Locked',
      description: 'The maximum value 90 is securely placed at the terminal index.',
      explanation: 'At the end of pass i, the last i elements are guaranteed to be in their final sorted positions.',
      keyTakeaway: 'Sorted sub-array boundary increases by 1 after each full outer pass.',
      visualState: {
        values: [34, 25, 12, 22, 11, 64, 90],
        highlightIndices: [6],
        pointerIndex: 6,
        statusMessage: 'Pass 1 completed. Element 90 locked at index 6. Outer loop boundary shrinks.',
      },
      mermaidDiagram: `flowchart LR
  Unsorted["Unsorted Region (Indices 0..5)"] --> Locked(["Locked Sorted: [6]: 90"])`,
    },
  ],
};

const LINKED_LIST_LESSON: InteractiveVisualLesson = {
  id: 'lesson_ll_01',
  title: 'Singly Linked List Node Insertion',
  subject: 'algorithms',
  difficulty: 'intermediate',
  overview: 'Observe dynamic pointer manipulation during an O(1) head insertion into a singly linked chain.',
  interactiveControlsEnabled: true,
  steps: [
    {
      stepNumber: 1,
      title: 'Allocate New Node',
      description: 'Create new node with value 42 and initialize its next pointer to NULL.',
      explanation: 'Memory is allocated on the heap for the new container holding both payload data and pointer address.',
      keyTakeaway: 'Always verify heap allocation succeeded before setting node fields.',
      visualState: {
        values: ['Node(42)', 'Head->[10]', '[20]', '[30]'],
        highlightIndices: [0],
        pointerIndex: 0,
        statusMessage: 'New node created at memory address 0x7ffd. Node.data = 42, Node.next = null.',
      },
      mermaidDiagram: `flowchart LR
  NewNode["New Node (42) -> null"]
  Head["Head (10)"] --> N2["Node (20)"] --> N3["Node (30)"]`,
    },
    {
      stepNumber: 2,
      title: 'Link New Node to Existing Head',
      description: 'Set NewNode.next = Head.',
      explanation: 'To avoid severing the existing chain, the new node must point to the existing list before updating the Head pointer.',
      keyTakeaway: 'Order of pointer assignment prevents memory leaks and dangling chains.',
      visualState: {
        values: ['Node(42)->[10]', '[10]', '[20]', '[30]'],
        highlightIndices: [0, 1],
        pointerIndex: 0,
        statusMessage: 'Pointer connected: NewNode.next now points to existing Head (10).',
      },
      mermaidDiagram: `flowchart LR
  NewNode["New Node (42)"] --> Head["Head (10)"] --> N2["Node (20)"] --> N3["Node (30)"]`,
    },
    {
      stepNumber: 3,
      title: 'Update Head Pointer',
      description: 'Assign Head = NewNode. Insertion complete in O(1) time.',
      explanation: 'The head reference is updated to point directly to the newly prepended node.',
      keyTakeaway: 'Head insertion requires zero traversal, yielding strictly O(1) constant time complexity.',
      visualState: {
        values: ['Head->[42]', '[10]', '[20]', '[30]'],
        highlightIndices: [0],
        pointerIndex: 0,
        statusMessage: 'Head updated to NewNode. List is now: 42 -> 10 -> 20 -> 30 -> null.',
      },
      mermaidDiagram: `flowchart LR
  HeadPtr["Head Pointer"] --> N1["Node (42)"] --> N2["Node (10)"] --> N3["Node (20)"] --> N4["Node (30)"] --> NullNode["null"]`,
    },
  ],
};

export const VisualStudioPage: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState('binary_search');
  const [currentLesson, setCurrentLesson] = useState<InteractiveVisualLesson>(DEMO_BINARY_SEARCH_LESSON);
  const [isNarrating, setIsNarrating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      id: 'binary_search',
      title: 'Binary Search Algorithm',
      complexity: 'O(log n)',
      lesson: DEMO_BINARY_SEARCH_LESSON,
    },
    {
      id: 'bubble_sort',
      title: 'Bubble Sort Invariant',
      complexity: 'O(n²)',
      lesson: BUBBLE_SORT_LESSON,
    },
    {
      id: 'linked_list',
      title: 'Linked List Node Insertion',
      complexity: 'O(1)',
      lesson: LINKED_LIST_LESSON,
    },
  ];

  const handleSelectPreset = (preset: (typeof presets)[0]) => {
    setSelectedTopicId(preset.id);
    setCurrentLesson(preset.lesson);
  };

  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setError(null);
    setIsGenerating(true);

    try {
      const res = await api.ai.visualize({
        topic: customTopic.trim(),
        subject: 'algorithms',
        difficulty: 'intermediate',
      });

      if (res.success && res.data?.data) {
        const visualData = res.data.data;
        const newLesson: InteractiveVisualLesson = {
          id: `custom_${Date.now()}`,
          title: visualData.title,
          subject: 'algorithms',
          difficulty: 'intermediate',
          overview: visualData.overview,
          interactiveControlsEnabled: true,
          steps: visualData.steps.map((s: any, idx: number) => ({
            stepNumber: s.stepNumber || idx + 1,
            title: s.title,
            description: s.description || '',
            explanation: s.explanation,
            keyTakeaway: s.keyTakeaway,
            visualState: s.visualState || { values: [1, 2, 3] },
            mermaidDiagram: s.mermaidDiagram,
          })),
        };

        setCurrentLesson(newLesson);
        setSelectedTopicId('custom');
      }
    } catch (err: any) {
      setError(err.message || 'Could not generate custom visualization.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent" size="sm">
              Module 02
            </Badge>
            <span className="text-xs text-slate-500 font-mono">
              Visual State Progression & Mermaid.js Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Visual Learning Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Transform abstract computational steps into observable, interactive state progressions and structural diagrams.
          </p>
        </div>

        {/* Audio Narration Toggle */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
          <Button
            variant={isNarrating ? 'danger' : 'outline'}
            size="sm"
            onClick={() => setIsNarrating(!isNarrating)}
            leftIcon={isNarrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          >
            {isNarrating ? 'Stop Audio Narration' : 'Enable Narration (Browser TTS)'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Preset Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedTopicId === preset.id
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>{preset.title}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                selectedTopicId === preset.id
                  ? 'bg-brand-700 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {preset.complexity}
            </span>
          </button>
        ))}

        {selectedTopicId === 'custom' && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap bg-brand-600 text-white border border-brand-600 shadow-sm"
          >
            <span>Custom: {currentLesson.title}</span>
          </button>
        )}
      </div>

      {/* Custom AI Visual Lesson Generator Form */}
      <Card className="bg-slate-50/50">
        <CardContent className="pt-4 pb-4">
          <form onSubmit={handleGenerateCustom} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Input
                label="Or Generate Custom Visual Model with AI & Mermaid.js"
                placeholder="e.g. Dijkstra's Shortest Path Algorithm, QuickSort Pivot Selection, or TCP 3-Way Handshake"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="md"
              isLoading={isGenerating}
              leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
            >
              Generate Visual Model
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Interactive Stage */}
      <InteractiveConceptVisualizer
        lesson={currentLesson}
        narrationEnabled={isNarrating}
        onToggleNarration={() => setIsNarrating(!isNarrating)}
      />
    </div>
  );
};

export default VisualStudioPage;
