/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Clock, 
  Check, 
  Copy, 
  Wand2, 
  HelpCircle, 
  Sliders, 
  Volume2, 
  Dumbbell, 
  FileText 
} from 'lucide-react';
import { DEFAULT_REEL_SCRIPT } from '../../constants/reelVoices';

interface ScriptEditorProps {
  script: string;
  onChangeScript: (newScript: string) => void;
  wordCount: number;
  charCount: number;
  estimatedSeconds: number;
  onOptimizeLength: (target: '15-20' | '20-30' | '30-40') => void;
  isOptimizing: boolean;
  onOpenAnalyzer: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onChangeScript,
  wordCount,
  charCount,
  estimatedSeconds,
  onOptimizeLength,
  isOptimizing,
  onOpenAnalyzer,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertTag = (tag: string) => {
    const trimmed = script.trim();
    if (!trimmed) {
      onChangeScript(tag + ' ');
      return;
    }
    onChangeScript(script + (script.endsWith('\n') ? '' : ' ') + tag + ' ');
  };

  const insertPhrase = (phrase: string) => {
    onChangeScript(script + (script.endsWith(' ') || script.endsWith('\n') ? '' : ' ') + phrase + ' ');
  };

  // Determine pacing category
  let durationBadgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let durationLabel = 'Optimal 20–30s Reel';
  if (estimatedSeconds < 20) {
    durationBadgeColor = 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    durationLabel = 'Punchy 15–20s Reel';
  } else if (estimatedSeconds > 35) {
    durationBadgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    durationLabel = 'Longer 35–45s Reel';
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl">
      
      {/* Top Header of Script Editor */}
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Hinglish Script Editor
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTips(!showTips)}
            className={`text-xs px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-colors ${
              showTips
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
            title="Toggle Hinglish & Delivery Rules"
          >
            <HelpCircle size={12} />
            <span>Rules</span>
          </button>

          <button
            onClick={() => onChangeScript(DEFAULT_REEL_SCRIPT)}
            className="text-xs text-zinc-400 hover:text-indigo-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Reset to Reference Birthday Tricep Monologue"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={handleCopy}
            className="text-xs text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Copy script"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Hinglish Rules Banner (collapsible) */}
      {showTips && (
        <div className="bg-indigo-950/40 border-b border-indigo-900/50 p-3 text-[11px] text-zinc-300 space-y-1.5 animate-fade-in">
          <div className="font-semibold text-indigo-300 flex items-center gap-1">
            <Sparkles size={12} />
            <span>Essential Performance Guidelines for Indian Fitness Reels:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-zinc-400">
            <li><strong className="text-zinc-200">Delivery:</strong> Real Indian guy talking to a friend between sets. Confident, restrained, no fake hype.</li>
            <li><strong className="text-zinc-200">Language:</strong> Hindi in Devanagari (e.g. <em>"कि अपने birthday पर..."</em>). Keep gym terms in English (<em>"clean, controlled reps"</em>, <em>"full-stack"</em>).</li>
            <li><strong className="text-zinc-200">Numbers:</strong> Write phonetically (<em>"a hundred kilos"</em> instead of <em>"100 kg"</em>, <em>"two clean reps"</em> instead of <em>"2 reps"</em>).</li>
            <li><strong className="text-zinc-200">Pacing:</strong> Short clauses, micro-pauses (0.08–0.20s), continuous forward flow.</li>
          </ul>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar">
        
        {/* Main Textarea */}
        <div className="relative flex-1 min-h-[220px]">
          <textarea
            value={script}
            onChange={(e) => onChangeScript(e.target.value)}
            placeholder="Type your Hindi / English Reel voiceover here..."
            className="w-full h-full min-h-[220px] bg-zinc-950/60 rounded-xl p-3.5 text-sm sm:text-base font-sans leading-relaxed text-zinc-100 placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none custom-scrollbar"
            spellCheck={false}
          />
        </div>

        {/* Live Counters & Target Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-zinc-950/50 px-3 py-2 rounded-xl border border-zinc-800/80">
          <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
            <span>Words: <strong className="text-zinc-200">{wordCount}</strong></span>
            <span>Chars: <strong className="text-zinc-200">{charCount}</strong></span>
            <span>Est: <strong className="text-zinc-200">{String(Math.floor(estimatedSeconds / 60)).padStart(2, '0')}:{String(estimatedSeconds % 60).padStart(2, '0')}</strong></span>
          </div>

          <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${durationBadgeColor}`}>
            {durationLabel}
          </div>
        </div>

        {/* Reel Duration Optimizers */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Clock size={12} className="text-indigo-400" />
              Reel Duration Optimizer
            </span>
            <button
              onClick={onOpenAnalyzer}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <Sparkles size={11} />
              Analyze Script
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onOptimizeLength('15-20')}
              disabled={isOptimizing}
              className="px-2 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-xs font-medium border border-zinc-700/70 text-center transition-all disabled:opacity-50"
            >
              <div className="font-bold text-[11px]">15–20s Reel</div>
              <div className="text-[9px] text-zinc-400">~35–55 words</div>
            </button>

            <button
              onClick={() => onOptimizeLength('20-30')}
              disabled={isOptimizing}
              className="px-2 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 text-xs font-medium border border-indigo-800/60 text-center transition-all disabled:opacity-50"
            >
              <div className="font-bold text-[11px]">20–30s Reel</div>
              <div className="text-[9px] text-indigo-300/80">~50–75 words</div>
            </button>

            <button
              onClick={() => onOptimizeLength('30-40')}
              disabled={isOptimizing}
              className="px-2 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-xs font-medium border border-zinc-700/70 text-center transition-all disabled:opacity-50"
            >
              <div className="font-bold text-[11px]">30–40s Reel</div>
              <div className="text-[9px] text-zinc-400">~75–105 words</div>
            </button>
          </div>
        </div>

        {/* Emotion Cue Chips */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Insert Natural Emotion Tags:
          </span>
          <div className="flex flex-wrap gap-1">
            {[
              '[conversational]',
              '[slight pause]',
              '[confident]',
              '[small proud smile]',
              '[slightly surprised]',
              '[emphasis]',
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => insertTag(tag)}
                className="px-2 py-0.5 text-[10px] rounded-lg font-mono bg-zinc-800/60 hover:bg-zinc-700/70 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all active:scale-95"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Natural Gym Vocabulary Helper */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <Dumbbell size={10} />
            Natural Gym Terms & Phonetic Numbers:
          </span>
          <div className="flex flex-wrap gap-1">
            {[
              'a hundred kilos',
              'two clean reps',
              'full-stack',
              'clean, controlled reps',
              'single-leg press',
              'leg growth',
            ].map((phrase) => (
              <button
                key={phrase}
                onClick={() => insertPhrase(phrase)}
                className="px-2 py-0.5 text-[10px] rounded-lg bg-zinc-800/40 hover:bg-indigo-950/50 text-indigo-300 border border-zinc-700/50 hover:border-indigo-700/60 transition-all active:scale-95"
              >
                + "{phrase}"
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
