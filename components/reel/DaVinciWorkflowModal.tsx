/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Layers, 
  X, 
  Download, 
  Sliders, 
  Cpu, 
  CheckCircle2, 
  Volume2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DaVinciWorkflowModalProps {
  onClose: () => void;
  onDownloadActiveWav?: () => void;
  hasAudio: boolean;
  voiceName: string;
}

export const DaVinciWorkflowModal: React.FC<DaVinciWorkflowModalProps> = ({
  onClose,
  onDownloadActiveWav,
  hasAudio,
  voiceName,
}) => {
  const steps = [
    {
      num: 1,
      title: 'Generate Performance Voice Here',
      desc: 'Use Reel Voiceover Studio to craft the exact Indian Hinglish conversational cadence, emotional progression, and micro-pauses (0.08–0.20s).',
    },
    {
      num: 2,
      title: 'Download Clean 24kHz WAV',
      desc: 'Export pristine audio with zero background music, zero reverb, and flat EQ. This ensures your voice conversion model receives clean source data.',
    },
    {
      num: 3,
      title: 'Import to DaVinci Resolve Studio (Fairlight)',
      desc: 'Drag the exported .WAV into your DaVinci project timeline under the Voiceover track alongside your 9:16 fitness video.',
    },
    {
      num: 4,
      title: 'Apply Your Personal Trained Voice Model',
      desc: 'Use DaVinci Resolve Studio’s AI Voice Remaster / Voice Model plugin (or RVC / personal voice conversion) on the track.',
    },
    {
      num: 5,
      title: 'Preserve Expression, Pacing & Emphasis',
      desc: 'The voice conversion takes the vocal tone of your voice while flawlessly inheriting the human-like pauses, Hinglish pronunciation, and energetic Reel flow generated here.',
    },
    {
      num: 6,
      title: 'Export Final Mastered Fitness Reel',
      desc: 'Add subtle background gym ambience or low-volume trending audio (-18dB) under the final transformed dialogue.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md animate-fade-in text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="davinci-title"
    >
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers size={18} />
            </div>
            <div>
              <h2 id="davinci-title" className="text-base font-bold text-white">
                DaVinci Resolve Studio Voice Conversion
              </h2>
              <p className="text-xs text-zinc-400">
                End-to-end production workflow from Gemini speech generation to personal voice clone.
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
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          
          {/* Key Rule Callout */}
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl flex items-start gap-3">
            <Cpu size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-200 block mb-1">
                The Performance is the Foundation:
              </span>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                The generated voice from this studio is <strong>not</strong> your final identity. It provides the natural Indian conversational flow, Hindi/English switching, and emotional inflections that AI voice conversion models need to sound truly human.
              </p>
            </div>
          </div>

          {/* 6 Steps List */}
          <div className="space-y-2.5">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-3"
              >
                <div className="h-6 w-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-200 text-xs">{step.title}</h3>
                  <p className="text-zinc-400 text-[11px] leading-relaxed mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
          >
            Got It
          </button>

          {hasAudio && onDownloadActiveWav && (
            <button
              onClick={() => {
                onDownloadActiveWav();
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg"
            >
              <Download size={14} />
              <span>Download Clean WAV ({voiceName})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
