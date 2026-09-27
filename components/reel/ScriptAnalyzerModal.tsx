/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Dumbbell, 
  FileCheck 
} from 'lucide-react';
import { ScriptAnalysisResult } from '../../types/reel';

interface ScriptAnalyzerModalProps {
  script: string;
  analysis: ScriptAnalysisResult | null;
  isLoading: boolean;
  onApplySuggestedScript: (newScript: string) => void;
  onClose: () => void;
  onRunAnalysis: () => void;
}

export const ScriptAnalyzerModal: React.FC<ScriptAnalyzerModalProps> = ({
  script,
  analysis,
  isLoading,
  onApplySuggestedScript,
  onClose,
  onRunAnalysis,
}) => {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (analysis?.suggestedScript) {
      onApplySuggestedScript(analysis.suggestedScript);
      setApplied(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md animate-fade-in text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analyzer-title"
    >
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="analyzer-title" className="text-base font-bold text-white">
                Reel Script Delivery Analyzer
              </h2>
              <p className="text-xs text-zinc-400">
                Audits natural Hinglish flow, spoken pronunciation, and Instagram Reel pacing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 size={32} className="animate-spin text-amber-400" />
              <span className="text-sm font-medium">Analyzing Hinglish gym cadence & pronunciation...</span>
            </div>
          ) : analysis ? (
            <>
              {/* Score & Verdict Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
                    Conversational Score
                  </span>
                  <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                    {analysis.naturalnessScore}/100
                  </div>
                  <span className="text-[10px] text-zinc-400">Authentic Gym-Talk</span>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
                    Pacing Evaluation
                  </span>
                  <div className="text-base font-bold text-indigo-400 mt-2">
                    {analysis.pacingVerdict}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {analysis.wordCount} words • ~{analysis.estimatedSeconds}s
                  </span>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center flex flex-col justify-center">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
                    Pronunciation Status
                  </span>
                  <div className="text-xs font-semibold text-zinc-200 mt-2">
                    {analysis.pronunciationRisks.length === 0
                      ? '✅ No Number or Term Risks'
                      : `⚠️ ${analysis.pronunciationRisks.length} Pronunciation Fix(es)`}
                  </div>
                </div>
              </div>

              {/* Summary note */}
              <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
                <span className="font-semibold text-zinc-300 block mb-1">Director's Appraisal:</span>
                <p className="text-zinc-400 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              {/* Pronunciation & Phrasing Risks */}
              {analysis.pronunciationRisks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Spoken TTS Pronunciation Recommendations:
                  </span>

                  <div className="space-y-2">
                    {analysis.pronunciationRisks.map((risk, i) => (
                      <div
                        key={i}
                        className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 font-mono line-through">{risk.original}</span>
                          <ArrowRight size={12} className="text-zinc-500" />
                          <span className="text-emerald-400 font-mono font-bold">{risk.suggestion}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{risk.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Polished Script */}
              {analysis.suggestedScript && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <FileCheck size={14} className="text-indigo-400" />
                      Polished Hinglish Script:
                    </span>
                    <span className="text-[10px] text-zinc-400">Preserves authentic story without unnecessary rewriting</span>
                  </div>

                  <pre className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-sans whitespace-pre-wrap text-zinc-200 leading-relaxed">
                    {analysis.suggestedScript}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center space-y-3">
              <p className="text-zinc-400">Click below to analyze the current script against Indian Hinglish conversational rules.</p>
              <button
                onClick={onRunAnalysis}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                Run Analysis Now
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
          >
            Close
          </button>

          {analysis?.suggestedScript && (
            <button
              onClick={handleApply}
              disabled={applied}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {applied ? <Check size={14} /> : <CheckCircle2 size={14} />}
              <span>{applied ? 'Applied to Editor!' : 'Apply Polished Script'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
