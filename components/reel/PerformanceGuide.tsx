/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Compass, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Dumbbell, 
  Volume2, 
  Zap 
} from 'lucide-react';
import { ScriptAnalysisResult } from '../../types/reel';

interface PerformanceGuideProps {
  analysis: ScriptAnalysisResult | null;
  onOpenAnalyzer: () => void;
  onOpenDaVinciGuide: () => void;
}

export const PerformanceGuide: React.FC<PerformanceGuideProps> = ({
  analysis,
  onOpenAnalyzer,
  onOpenDaVinciGuide,
}) => {
  const guideItems = analysis?.performanceGuide || [
    {
      segment: 'A few days ago, I gave myself a small challenge —',
      emotion: 'Curious / Hook',
      pacing: 'Slightly Fast',
      energy: 'Medium',
      pause: 'Micro (0.1s)',
      emphasisWords: ['challenge'],
      directorTip: 'Draw the viewer in casually as if chatting at the water cooler',
    },
    {
      segment: 'कि अपने birthday पर full-stack tricep pushdown की एक clean rep निकालनी है.',
      emotion: 'Personal context',
      pacing: 'Conversational forward flow',
      energy: 'Medium',
      pause: 'Slight pause (0.2s)',
      emphasisWords: ['birthday', 'full-stack', 'clean rep'],
      directorTip: 'Crisp Devanagari Hindi with natural English gym terms',
    },
    {
      segment: 'Full stack की जगह, I wanted to hit a hundred kilos...',
      emotion: 'Surprise / Shift',
      pacing: 'Deliberate',
      energy: 'Medium-High',
      pause: 'Micro (0.1s)',
      emphasisWords: ['hundred kilos'],
      directorTip: 'Slight inflection of spontaneous self-challenge',
    },
    {
      segment: 'और one rep की जगह, I actually got two clean, controlled reps.',
      emotion: 'Controlled pride',
      pacing: 'Slightly fast',
      energy: 'Medium',
      pause: 'Micro (0.1s)',
      emphasisWords: ['two', 'clean', 'controlled'],
      directorTip: 'Restrained, authentic pride without boasting',
    },
    {
      segment: "And honestly... I think that's a pretty good birthday gift.",
      emotion: 'Natural satisfaction',
      pacing: 'Relaxed payoff',
      energy: 'Medium',
      pause: 'None',
      emphasisWords: ['birthday gift'],
      directorTip: 'Warm, subtle smile in the voice',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl">
      
      {/* Top Header */}
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Performance Guide & Delivery
          </h2>
        </div>

        <button
          onClick={onOpenAnalyzer}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
          title="Run full AI script analysis"
        >
          <Sparkles size={12} />
          <span>Analyze Script</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar text-xs">
        
        {/* Reel Story Arc Indicator */}
        <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
              <Zap size={13} className="text-amber-400" />
              7-Step Fitness Reel Progression:
            </span>
          </div>

          <div className="flex flex-wrap gap-1 text-[10px]">
            {[
              '1. Hook',
              '2. Context',
              '3. Action',
              '4. Surprise',
              '5. Result',
              '6. Reaction',
              '7. Payoff',
            ].map((step, i) => (
              <span
                key={step}
                className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-mono"
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Sentence by Sentence Breakdown (Section 19) */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Sentence-by-Sentence Delivery Plan:
          </span>

          <div className="space-y-2">
            {guideItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-2"
              >
                {/* Sentence text */}
                <p className="font-sans text-zinc-200 text-xs font-medium leading-relaxed">
                  "{item.segment}"
                </p>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <div className="bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800">
                    <span className="text-zinc-500">Emotion: </span>
                    <span className="text-amber-300 font-semibold">{item.emotion}</span>
                  </div>

                  <div className="bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800">
                    <span className="text-zinc-500">Pacing: </span>
                    <span className="text-sky-300 font-semibold">{item.pacing}</span>
                  </div>

                  <div className="bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800">
                    <span className="text-zinc-500">Pause: </span>
                    <span className="text-indigo-300">{item.pause}</span>
                  </div>

                  <div className="bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800">
                    <span className="text-zinc-500">Energy: </span>
                    <span className="text-emerald-300">{item.energy}</span>
                  </div>
                </div>

                {/* Emphasis and tip */}
                {item.emphasisWords && item.emphasisWords.length > 0 && (
                  <div className="text-[10px] text-zinc-400">
                    <span className="text-zinc-500">Emphasis: </span>
                    {item.emphasisWords.map((w, i) => (
                      <span
                        key={i}
                        className="inline-block bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1 py-0.2 rounded mr-1"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-zinc-400 italic">
                  💡 {item.directorTip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DaVinci Conversion Card */}
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
              <Layers size={13} />
              DaVinci Resolve Voice Conversion
            </span>
          </div>

          <p className="text-[11px] text-zinc-300 leading-relaxed">
            The exported voiceover captures the exact pacing, Indian Hinglish inflection, and micro-pauses. Load into DaVinci Resolve Studio to apply your trained personal voice model.
          </p>

          <button
            onClick={onOpenDaVinciGuide}
            className="w-full py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-xs font-medium border border-indigo-700/60 transition-colors flex items-center justify-center gap-1"
          >
            <span>Learn DaVinci Fairlight Workflow</span>
            <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </div>
  );
};
