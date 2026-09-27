/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, X, ArrowRight, Wand2 } from 'lucide-react';
import { Voice, AiRecommendation } from '../types';

interface VoiceFinderProps {
  voices: Voice[];
  onRecommendation: (rec: AiRecommendation | null) => void;
  onClose: () => void;
  initialQuery?: string;
}

const VoiceFinder: React.FC<VoiceFinderProps> = ({ voices, onRecommendation, onClose, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap implementation
  useEffect(() => {
    textAreaRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const examples = [
    {
      label: '🎂 100kg Birthday Milestone',
      text: "[excited, surprised] A few days ago, I was just trying to get one clean rep… [short pause] But today… I got three. [confident] And this isn't just the full stack. The stack is around 91 kilos, so I added another 10-kilo plate — making it roughly 100 kilos. [proud, controlled] Three reps. Controlled. And honestly… that's a pretty good birthday gift. 🎂",
    },
    { label: 'Irish male', text: 'A high pitch male with a strong Irish accent and upbeat story.' },
    { label: 'Singaporean female', text: 'An energetic Singaporean female with a lively Singlish tone.' },
    { label: 'Calm Documentarian', text: 'A deep, resonant, cinematic documentary narrator.' },
  ];

  const handleAnalyze = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/casting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          voices: voices.map((v) => ({
            name: v.name,
            gender: v.analysis.gender,
            pitch: v.analysis.pitch,
            characteristics: v.analysis.characteristics,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Casting request failed');
      }

      const result = await response.json();

      if (result.recommendedVoices && result.recommendedVoices.length > 0) {
        onRecommendation({
          voiceNames: result.recommendedVoices,
          systemInstruction: result.systemInstruction,
          sampleText: result.sampleText,
        });
      } else {
        setError('No matching voices found.');
      }
    } catch (err: any) {
      console.error('AI Casting Error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="casting-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-zinc-900/5 max-h-[92vh] flex flex-col"
      >
        {/* Decorative Header Background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-50/50 to-white/0 dark:from-indigo-900/30 dark:to-zinc-900/0 pointer-events-none"></div>

        <div className="relative p-6 sm:p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                <Wand2 size={20} />
                <span className="text-xs font-bold tracking-wider uppercase">AI Casting Director</span>
              </div>
              <h2 id="casting-title" className="text-3xl font-serif font-medium tracking-tight text-zinc-900 dark:text-white">
                Describe your character or paste script.
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                Gemini 3.8 analyzes vocal timbre, acoustic pacing, and emotional cues to cast the ideal voice.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative group space-y-4">
            <textarea
              ref={textAreaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. [excited, surprised] A few days ago, I was just trying to get one clean rep… But today I got three 100kg reps! Energetic, triumphant birthday gym milestone..."
              className="w-full h-36 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-base font-sans text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-600 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-zinc-900 resize-none transition-all leading-relaxed"
              disabled={loading}
              autoFocus
            />

            {/* Examples */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                Quick Cast Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => {
                      setQuery(ex.text);
                      textAreaRef.current?.focus();
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-left"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium flex items-center gap-2">
                {error ? (
                  <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                    <X size={14} /> {error}
                  </span>
                ) : (
                  <>
                    Casting via <span className="text-indigo-500 dark:text-indigo-400 font-semibold">Gemini 3.8</span>
                  </>
                )}
              </span>

              <button
                onClick={handleAnalyze}
                disabled={loading || !query.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-indigo-500/25 dark:shadow-indigo-900/25"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Cast Voices</span>
                {!loading && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full bg-indigo-600 dark:bg-indigo-500 animate-google-colors"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceFinder;
