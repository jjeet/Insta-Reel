/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Download, 
  Loader2, 
  Volume2, 
  Gauge, 
  Check, 
  Layers, 
  SlidersHorizontal,
  Flame,
  UserCheck
} from 'lucide-react';
import { VoiceOption, MultiVoiceAudition } from '../../types/reel';
import AudioVisualizer from '../AudioVisualizer';

interface AudioBenchProps {
  primaryVoice: VoiceOption;
  benchVoices: MultiVoiceAudition[];
  activePlayingVoice: string | null;
  onPlayToggle: (voiceName: string) => void;
  onSynthesizeVoice: (voiceName: string) => void;
  onSynthesizeAll: () => void;
  isSynthesizingAll: boolean;
  onDownloadWav: (voiceName: string) => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  currentPlaybackTime: number;
  durationSeconds: number;
  onOpenDaVinciGuide: () => void;
}

export const AudioBench: React.FC<AudioBenchProps> = ({
  primaryVoice,
  benchVoices,
  activePlayingVoice,
  onPlayToggle,
  onSynthesizeVoice,
  onSynthesizeAll,
  isSynthesizingAll,
  onDownloadWav,
  playbackSpeed,
  onChangePlaybackSpeed,
  currentPlaybackTime,
  durationSeconds,
  onOpenDaVinciGuide,
}) => {
  const primaryAudition = benchVoices.find((v) => v.voiceName === primaryVoice.name) || benchVoices[0];
  const isPrimaryPlaying = activePlayingVoice === primaryAudition?.voiceName;

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl">
      
      {/* Top Header */}
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Reel Performance & Multi-Voice Bench
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
            Speed:
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
            {[0.8, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangePlaybackSpeed(speed)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded font-medium transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            onClick={onSynthesizeAll}
            disabled={isSynthesizingAll}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
            title="Generate audio for Voice A, B, and C simultaneously"
          >
            {isSynthesizingAll ? <Loader2 size={12} className="animate-spin" /> : <Flame size={12} />}
            <span>Audition All 3</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Player */}
      <div className="p-4 flex flex-col gap-4">
        
        {/* Waveform Area */}
        <div className="relative h-28 sm:h-32 bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden flex flex-col justify-between p-3 group">
          
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '10px 10px',
            }}
          ></div>

          {/* Visualizer center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
            {activePlayingVoice ? (
              <div className="w-full h-20 opacity-90">
                <AudioVisualizer isPlaying={true} color="#818cf8" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-zinc-500 text-xs">
                <Gauge size={20} className="text-zinc-600" />
                <span>Ready for Indian Hinglish Reel synthesis (24kHz Clean WAV)</span>
              </div>
            )}
          </div>

          {/* Top Info overlay */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{activePlayingVoice ? `Playing: ${activePlayingVoice}` : `Selected: ${primaryVoice.name}`}</span>
            </span>

            <span>
              {String(Math.floor(currentPlaybackTime / 60)).padStart(2, '0')}:
              {String(Math.floor(currentPlaybackTime % 60)).padStart(2, '0')} /{' '}
              {String(Math.floor(durationSeconds / 60)).padStart(2, '0')}:
              {String(Math.floor(durationSeconds % 60)).padStart(2, '0')}
            </span>
          </div>

          {/* Bottom Audio Info */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Pacing: 1.25x forward energy • Micro-pauses (0.08–0.20s)</span>
            <span className="text-indigo-400">Clean Speech • DaVinci Ready</span>
          </div>
        </div>

        {/* Multi-Voice Comparison Cards (Section 14 & 15) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <UserCheck size={14} className="text-indigo-400" />
              Multi-Voice Comparison Bench:
            </span>
            <span className="text-[11px] text-zinc-500">
              Same performance script across 3 vocal characters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {benchVoices.map((bench, idx) => {
              const isPlayingThis = activePlayingVoice === bench.voiceName;
              const hasAudio = !!bench.rawPcm;

              return (
                <div
                  key={bench.voiceName}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    isPlayingThis
                      ? 'bg-indigo-950/40 border-indigo-600 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                        <span>{bench.voiceName}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {bench.label}
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 line-clamp-1">
                      {idx === 0
                        ? 'Conversational, authentic, warm'
                        : idx === 1
                        ? 'High energy, athletic, confident'
                        : 'Casual, fast, partner chat'}
                    </p>
                  </div>

                  {/* Actions for this Voice */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-zinc-800/60">
                    <button
                      onClick={() => {
                        if (hasAudio) {
                          onPlayToggle(bench.voiceName);
                        } else {
                          onSynthesizeVoice(bench.voiceName);
                        }
                      }}
                      disabled={bench.isLoading}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                        isPlayingThis
                          ? 'bg-zinc-200 text-zinc-900 shadow'
                          : hasAudio
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      } ${bench.isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {bench.isLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : isPlayingThis ? (
                        <>
                          <Square size={12} className="fill-current" />
                          <span>Stop</span>
                        </>
                      ) : hasAudio ? (
                        <>
                          <Play size={12} className="fill-current" />
                          <span>Play</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} />
                          <span>Audition</span>
                        </>
                      )}
                    </button>

                    {hasAudio && (
                      <button
                        onClick={() => onDownloadWav(bench.voiceName)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 transition-colors"
                        title={`Download clean 24kHz WAV for ${bench.voiceName}`}
                      >
                        <Download size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DaVinci Voice Conversion Notice & Callout (Section 21) */}
        <div className="mt-1 bg-gradient-to-r from-indigo-950/30 via-zinc-900 to-indigo-950/20 border border-indigo-900/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-900/40 text-indigo-400">
              <Layers size={16} />
            </div>
            <div>
              <span className="font-bold text-zinc-200">
                Source Audio for DaVinci Resolve Studio:
              </span>
              <p className="text-[11px] text-zinc-400">
                Exported WAV preserves natural Hinglish inflection, pauses, and cadence for voice conversion models.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDaVinciGuide}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/60 font-medium shrink-0 transition-colors"
          >
            View 6-Step Workflow
          </button>
        </div>

      </div>
    </div>
  );
};
