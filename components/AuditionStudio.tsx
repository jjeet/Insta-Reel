/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Voice } from '../types';
import { 
  Play, 
  Square, 
  Loader2, 
  Download, 
  Wand2, 
  Sparkles, 
  X, 
  RotateCcw, 
  Volume2, 
  Dumbbell, 
  Sliders, 
  Check, 
  Copy 
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { decodeBase64, decodeAudioData, downloadWav } from '../utils/audioUtils';

interface AuditionStudioProps {
  voices: Voice[];
  initialScript?: string;
  onClose: () => void;
  onOpenAiCastingWithText?: (text: string) => void;
}

export const DEFAULT_WORKOUT_SCRIPT = `[excited, surprised] A few days ago, I was just trying to get one clean rep…

[short pause]
But today… I got three.

[confident] And this isn't just the full stack.
The stack is around 91 kilos,
so I added another 10-kilo plate —
making it roughly 100 kilos.

[proud, controlled] Three reps.
Controlled.

And honestly…
that's a pretty good birthday gift. 🎂`;

const AuditionStudio: React.FC<AuditionStudioProps> = ({
  voices,
  initialScript = DEFAULT_WORKOUT_SCRIPT,
  onClose,
  onOpenAiCastingWithText,
}) => {
  const [script, setScript] = useState(initialScript);
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    // Default to an energetic/confident voice that fits this script like Enceladus or Fenrir or Puck
    const preferred = voices.find(v => v.name === 'Enceladus' || v.name === 'Fenrir' || v.name === 'Puck');
    return preferred ? preferred.name : (voices[0]?.name || 'Puck');
  });

  const [deliveryStyle, setDeliveryStyle] = useState('Excited, confident, proud, controlled personal athletic milestone');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPcmBytes, setLastPcmBytes] = useState<Uint8Array | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [copied, setCopied] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const isMountedRef = useRef(true);

  // Recommended voices for workout milestone
  const recommendedVoiceNames = ['Enceladus', 'Fenrir', 'Orus', 'Algieba', 'Puck', 'Alnilam'];
  const recommendedVoices = voices.filter(v => recommendedVoiceNames.includes(v.name));

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (isMountedRef.current) {
      setIsPlaying(false);
    }
  };

  const handleSynthesizeAndPlay = async (targetVoice?: string) => {
    const voiceToUse = targetVoice || selectedVoiceName;
    if (isLoading) return;

    if (isPlaying) {
      stopAudio();
      // If simply toggling play/pause with already generated buffer for the same voice
      if (!targetVoice || targetVoice === selectedVoiceName) {
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          voiceName: voiceToUse,
          style: deliveryStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to synthesize speech');
      }

      const data = await response.json();
      if (!isMountedRef.current) return;

      const audioData = data.audio;
      if (!audioData) throw new Error('No audio returned by server');

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const rawBytes = decodeBase64(audioData);
      setLastPcmBytes(rawBytes);
      const buffer = await decodeAudioData(rawBytes, audioContextRef.current, 24000);
      setAudioBuffer(buffer);

      if (!isMountedRef.current) return;

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackSpeed;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        if (isMountedRef.current) setIsPlaying(false);
      };

      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
      if (targetVoice) {
        setSelectedVoiceName(targetVoice);
      }
    } catch (err: any) {
      console.error('Synthesis error:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Speech synthesis failed. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (!lastPcmBytes) return;
    const cleanName = selectedVoiceName.toLowerCase();
    downloadWav(lastPcmBytes, `${cleanName}-100kg-birthday-monologue.wav`, 24000);
  };

  const insertTag = (tag: string) => {
    setScript(prev => prev + (prev.endsWith('\n') || prev.length === 0 ? '' : ' ') + tag + ' ');
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentVoiceObj = voices.find(v => v.name === selectedVoiceName);

  return (
    <div 
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-title"
    >
      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col animate-slide-up">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Dumbbell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="studio-title" className="text-lg font-bold text-zinc-900 dark:text-white font-display">
                  Voice Audition Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Gemini 3.8 Flash TTS
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Audition monologues, test vocal pacing, and synthesize expressive dialogue.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Copy Script"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close audition studio"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">
          
          {/* Left Column: Script Editor & Expression Tags (7 cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders size={14} className="text-indigo-500" />
                Audition Script & Delivery Cues
              </label>

              <button
                onClick={() => setScript(DEFAULT_WORKOUT_SCRIPT)}
                className="text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                title="Reset to Birthday 100kg Workout Monologue"
              >
                <RotateCcw size={12} />
                Reset Monologue
              </button>
            </div>

            {/* Script Text Area */}
            <div className="relative">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Enter or paste speech script here..."
                rows={9}
                className="w-full bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-4 text-sm font-sans leading-relaxed text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none custom-scrollbar"
              />
              <div className="absolute bottom-3 right-3 text-[11px] font-medium text-zinc-400 bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-200/50 dark:border-zinc-800/50">
                {script.length} chars • ~{Math.max(1, Math.round(script.split(/\s+/).filter(Boolean).length / 2.5))}s
              </div>
            </div>

            {/* Expression Cue Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Insert Directional Cue:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '[excited, surprised]',
                  '[short pause]',
                  '[confident]',
                  '[proud, controlled]',
                  '[breathless]',
                  '[triumphant]',
                  '[warm chuckle]',
                  '<breath>',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => insertTag(tag)}
                    className="px-2.5 py-1 text-xs rounded-lg font-mono bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-700/60 transition-all active:scale-95"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Director's Delivery Tone */}
            <div className="bg-zinc-50/80 dark:bg-zinc-800/40 rounded-2xl p-3.5 border border-zinc-200/60 dark:border-zinc-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Performance Note (Style Prompt)
                </span>
                <span className="text-[11px] text-zinc-400">Guiding Gemini 3.8 Flash TTS</span>
              </div>
              <input
                type="text"
                value={deliveryStyle}
                onChange={(e) => setDeliveryStyle(e.target.value)}
                placeholder="e.g. Excited, triumphant, breathless personal milestone"
                className="w-full text-xs bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

          </div>

          {/* Right Column: Voice Selection, Audition Controls & Visualizer (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-zinc-50/40 dark:bg-zinc-900/40 flex flex-col justify-between gap-5">
            
            <div className="space-y-4">
              
              {/* Selected Voice Card */}
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Active Voice Cast
                  </span>
                  {currentVoiceObj && (
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                        {currentVoiceObj.analysis.gender}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                        {currentVoiceObj.pitch} Pitch
                      </span>
                    </div>
                  )}
                </div>

                {/* Voice Dropdown */}
                <select
                  value={selectedVoiceName}
                  onChange={(e) => {
                    setSelectedVoiceName(e.target.value);
                    if (isPlaying) stopAudio();
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  disabled={isLoading}
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} — {v.analysis.gender} ({v.analysis.characteristics.slice(0, 2).join(', ')})
                    </option>
                  ))}
                </select>

                {currentVoiceObj && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    Characteristics: {currentVoiceObj.analysis.characteristics.join(', ')}
                  </p>
                )}
              </div>

              {/* Recommended Quick Cast for this Workout Monologue */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Recommended for this Monologue:</span>
                  <span className="text-[10px] text-indigo-500 font-normal">1-Click Audition</span>
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {recommendedVoices.map((v) => {
                    const isSelected = selectedVoiceName === v.name;
                    return (
                      <button
                        key={v.name}
                        onClick={() => {
                          setSelectedVoiceName(v.name);
                          handleSynthesizeAndPlay(v.name);
                        }}
                        disabled={isLoading}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                            : 'bg-white dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">{v.name}</span>
                          <span className="text-[10px] text-zinc-400">{v.analysis.gender}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {v.analysis.characteristics[0]} • {v.pitch}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visualizer Display Area */}
              <div className="relative h-24 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                {isPlaying ? (
                  <div className="w-full h-full opacity-90 p-2">
                    <AudioVisualizer isPlaying={true} color="#818cf8" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-zinc-500">
                    <Volume2 size={22} />
                    <span className="text-[11px] font-medium">Ready to Audition {selectedVoiceName}</span>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 bg-red-950/90 text-red-200 text-xs flex items-center justify-center p-3 text-center">
                    {error}
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-2">
              
              {/* Playback speed toggle */}
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
                <span>Playback Speed:</span>
                <div className="flex gap-1.5">
                  {[0.8, 1.0, 1.25].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSynthesizeAndPlay()}
                  disabled={isLoading || !script.trim()}
                  className="flex-1 py-3 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Synthesizing Audio...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Square size={16} className="fill-current" />
                      <span>Stop Audition</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-current" />
                      <span>Audition Monologue</span>
                    </>
                  )}
                </button>

                {lastPcmBytes && (
                  <button
                    onClick={handleDownload}
                    className="p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                    title="Download pristine 24kHz WAV"
                  >
                    <Download size={18} />
                  </button>
                )}

                {onOpenAiCastingWithText && (
                  <button
                    onClick={() => {
                      onOpenAiCastingWithText(script);
                      onClose();
                    }}
                    className="p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    title="Launch AI Casting Director on this script"
                  >
                    <Wand2 size={18} />
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AuditionStudio;
