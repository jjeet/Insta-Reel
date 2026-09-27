/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Dumbbell, 
  Video, 
  Layers, 
  Sparkles, 
  Sun, 
  Moon, 
  Film, 
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { VoiceOption } from '../../types/reel';

interface HeaderBarProps {
  selectedVoice: VoiceOption;
  onSelectVoice: (voice: VoiceOption) => void;
  voices: VoiceOption[];
  onOpenVideoSync: () => void;
  onOpenDaVinciGuide: () => void;
  onOpenAnalyzer: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  wordCount: number;
  estimatedSeconds: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedVoice,
  onSelectVoice,
  voices,
  onOpenVideoSync,
  onOpenDaVinciGuide,
  onOpenAnalyzer,
  isDarkMode,
  toggleTheme,
  wordCount,
  estimatedSeconds,
}) => {
  return (
    <header className="w-full bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-xl px-4 lg:px-6 py-3 shrink-0 z-40 text-white">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Purpose */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Film size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white font-display">
                  Reel Voiceover Studio
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame size={10} />
                  Indian Hinglish Fitness
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Natural conversational gym-talk for Instagram Reels • DaVinci Resolve source audio
              </p>
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenVideoSync}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs border border-zinc-700"
              title="Video Sync"
            >
              <Video size={14} />
            </button>
            <button
              onClick={onOpenDaVinciGuide}
              className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-300 text-xs border border-indigo-800"
              title="DaVinci Voice Conversion"
            >
              <Layers size={14} />
            </button>
          </div>
        </div>

        {/* Center / Stats & Voice */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-center">
          
          {/* Voice Selector */}
          <div className="relative">
            <select
              value={selectedVoice.id}
              onChange={(e) => {
                const found = voices.find((v) => v.id === e.target.value);
                if (found) onSelectVoice(found);
              }}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer pr-7 hover:border-zinc-600 transition-colors"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  🎙️ {v.name} ({v.tone.split(',')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-xl text-xs">
            <span className="text-zinc-400">Reel Target:</span>
            <span className="font-mono font-bold text-amber-400">{wordCount}w</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono font-bold text-indigo-400">~{estimatedSeconds}s</span>
          </div>

          {/* Engine indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gemini 3.8 Flash TTS (24kHz)</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAnalyzer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all hover:border-zinc-600"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Analyze Script</span>
          </button>

          <button
            onClick={onOpenVideoSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all hover:border-zinc-600"
          >
            <Video size={13} className="text-violet-400" />
            <span>Visual Timeline</span>
          </button>

          <button
            onClick={onOpenDaVinciGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 text-xs font-medium border border-indigo-800/80 transition-all"
            title="DaVinci Resolve Studio Voice Conversion Workflow"
          >
            <Layers size={13} />
            <span>DaVinci Guide</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

      </div>
    </header>
  );
};
