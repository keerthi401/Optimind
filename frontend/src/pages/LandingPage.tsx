import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Eye,
  FileText,
  HelpCircle,
  Compass,
  Volume2,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card, CardTitle, CardDescription } from '../components/common/Card';
import { InteractiveConceptVisualizer } from '../components/visualizer/InteractiveConceptVisualizer';

export const LandingPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does OptiMind AI differ from generic chatbots?',
      a: 'Unlike generic chatbots that output ungrounded blocks of text, OptiMind AI transforms concepts into interactive, step-by-step visual models and anchors answers directly to your uploaded study materials with verified page citations.',
    },
    {
      q: 'What learning materials can I upload?',
      a: 'OptiMind AI supports PDF lecture slides and textbooks, plain text notes (.txt), and textbook snapshot images (PNG, JPG). Uploaded documents undergo OCR, semantic chunking, and isolated vector retrieval.',
    },
    {
      q: 'How does the Visual Learning Engine work?',
      a: 'The engine parses algorithmic steps, mathematical proofs, and scientific processes into discrete, visual stages. Students can step forward/backward, adjust simulation speeds, inspect internal state transitions, and listen to synchronized narration.',
    },
    {
      q: 'Are my uploaded study files kept private?',
      a: 'Yes. Files and extracted text chunks are isolated to your authenticated account. Document contents are never shared across users or used to train third-party foundation models without consent.',
    },
    {
      q: 'Is there a guest mode for testing?',
      a: 'Yes! You can explore the student dashboard and visual engine immediately in guest mode. When you are ready to persist quiz history, custom roadmaps, and private documents, you can register for a persistent account.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Subtle gradient background pattern */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/40 via-accent-50/20 to-transparent pointer-events-none -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1 text-xs font-semibold text-brand-700 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Production Educational Platform</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-normal">v1.0 Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                See It. Understand It.{' '}
                <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-accent-600 bg-clip-text text-transparent">
                  Master It.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
                OptiMind AI bridges the gap between passive reading and deep conceptual mastery. Transform dense lectures and textbooks into interactive step-by-step visual lessons, grounded document answers, and adaptive assessments.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto text-base px-6 py-3"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Start Learning Now
                  </Button>
                </Link>

                <a href="#visual-engine" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto text-base px-6 py-3"
                    leftIcon={<Eye className="w-4 h-4 text-brand-600" />}
                  >
                    Explore Visual Engine
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real interactive simulations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Document-grounded RAG</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Private & isolated workspace</span>
                </div>
              </div>
            </div>

            {/* Interactive Concept Preview */}
            <div id="visual-engine" className="mt-14 max-w-5xl mx-auto">
              <div className="text-center mb-6">
                <Badge variant="accent" size="sm">
                  Interactive Live Preview
                </Badge>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  Experience Visual Concept Breakdown
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Interact with our logarithmic search simulation below. Step through each operation in real-time.
                </p>
              </div>

              <InteractiveConceptVisualizer />
            </div>
          </div>
        </section>

        {/* Core Capabilities Grid */}
        <section id="features" className="py-20 bg-white border-y border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="brand" size="sm">
                Engineered for Retention
              </Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Purpose-Built Modules for Mastery
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                OptiMind AI combines proven cognitive learning methodologies with modern AI architectures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="hover:border-brand-300 transition-all">
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">AI Concept Explainer</CardTitle>
                <CardDescription className="mt-2 text-xs leading-relaxed">
                  Deconstruct complex topics into multiple difficulty tiers (beginner, intermediate, advanced) with intuitive real-world analogies and key terminology definitions.
                </CardDescription>
              </Card>

              {/* Feature 2 */}
              <Card className="hover:border-brand-300 transition-all">
                <div className="h-10 w-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center mb-4">
                  <Eye className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Visual Learning Engine</CardTitle>
                <CardDescription className="mt-2 text-xs leading-relaxed">
                  Generates interactive step-by-step diagrams, algorithmic traces, and state transitions so students can visualize what is happening under the hood.
                </CardDescription>
              </Card>

              {/* Feature 3 */}
              <Card className="hover:border-brand-300 transition-all">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Grounded Document RAG</CardTitle>
                <CardDescription className="mt-2 text-xs leading-relaxed">
                  Upload textbooks and lecture notes. Answers are strictly synthesized against retrieved document chunks with verifiable page and paragraph citations.
                </CardDescription>
              </Card>

              {/* Feature 4 */}
              <Card className="hover:border-brand-300 transition-all">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Adaptive Assessments</CardTitle>
                <CardDescription className="mt-2 text-xs leading-relaxed">
                  Test your understanding with server-evaluated diagnostic quizzes. Pinpoint specific conceptual misunderstandings and receive targeted revision paths.
                </CardDescription>
              </Card>

              {/* Feature 5 */}
              <Card className="hover:border-brand-300 transition-all">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Compass className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Personalized Study Roadmaps</CardTitle>
                <CardDescription className="mt-2 text-xs leading-relaxed">
                  Generate structured milestone plans aligned with your target timeline, weekly study budget, and verified mastery milestones.
                </CardDescription>
              </Card>

              {/* Feature 6 */}
              <Card className="hover:border-brand-300 transition-all">
                <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                  <Volume2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Accessible Speech Narration</CardTitle>
                <CardDescription className="mt-2 text-xs leading-relaxed">
                  Audio-assisted learning with playback controls and synchronized visual step highlighting for multimodal cognitive reinforcement.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="accent" size="sm">
                Systematic Learning Methodology
              </Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                How OptiMind AI Works
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                A verified three-step cycle ensuring conceptual depth and long-term retention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
                <div className="h-8 w-8 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Input or Upload Materials
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit a topic query or upload class slides, lecture notes, or PDF textbook chapters. The system processes and indexes the exact content.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
                <div className="h-8 w-8 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Visualize & Deconstruct
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  OptiMind breaks the topic into structured steps and diagrams. Step through each phase, inspect the state transitions, and listen to synchronized narration.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
                <div className="h-8 w-8 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Evaluate & Retain
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete diagnostic assessments to expose blind spots. OptiMind updates your roadmap and provides targeted revision paths for weak topics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Learning Materials */}
        <section id="materials" className="py-20 bg-white border-y border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="brand" size="sm">
                Input Compatibility
              </Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Supported Learning Materials
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Bring your own curriculum. OptiMind supports standardized educational media formats.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-center">
                <div className="h-12 w-12 mx-auto rounded-lg bg-red-100 text-red-700 flex items-center justify-center mb-3 font-bold font-mono text-xs">
                  PDF
                </div>
                <h4 className="font-semibold text-sm text-slate-900">PDF Documents</h4>
                <p className="text-xs text-slate-500 mt-1">Textbooks, research papers, lecture handouts</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-center">
                <div className="h-12 w-12 mx-auto rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3 font-bold font-mono text-xs">
                  TXT
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Plain Text</h4>
                <p className="text-xs text-slate-500 mt-1">Markdown, lecture transcripts, study notes</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-center">
                <div className="h-12 w-12 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 font-bold font-mono text-xs">
                  IMG
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Images (PNG/JPG)</h4>
                <p className="text-xs text-slate-500 mt-1">Printed textbook scans, diagram charts</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-center">
                <div className="h-12 w-12 mx-auto rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center mb-3 font-bold font-mono text-xs">
                  PROMPT
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Concept Queries</h4>
                <p className="text-xs text-slate-500 mt-1">Direct questions across math, science, & CS</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-slate-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="neutral" size="sm">
                Common Questions
              </Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200/90 bg-white transition-all overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-slate-900 text-sm focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Ready to Master Your Next Subject?
            </h2>
            <p className="text-brand-200 text-sm max-w-xl mx-auto leading-relaxed">
              Explore OptiMind AI's student workspace today. Start with interactive simulations and structured study roadmaps.
            </p>
            <div className="pt-2">
              <Link to="/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-brand-900 hover:bg-slate-100 focus-visible:ring-white font-bold"
                  rightIcon={<ArrowRight className="w-4 h-4 text-brand-900" />}
                >
                  Enter Student Workspace
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
