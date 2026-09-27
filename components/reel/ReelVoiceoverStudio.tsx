/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  REEL_VOICES, 
  DEFAULT_REEL_SCRIPT 
} from '../../constants/reelVoices';
import { 
  VoiceOption, 
  ScriptAnalysisResult, 
  MultiVoiceAudition 
} from '../../types/reel';
import { HeaderBar } from './HeaderBar';
import { ScriptEditor } from './ScriptEditor';
import { AudioBench } from './AudioBench';
import { PerformanceGuide } from './PerformanceGuide';
import { ScriptAnalyzerModal } from './ScriptAnalyzerModal';
import { VisualTimelineModal } from './VisualTimelineModal';
import { DaVinciWorkflowModal } from './DaVinciWorkflowModal';
import { decodeBase64, decodeAudioData, downloadWav } from '../../utils/audioUtils';
import { 
  Play, 
  Square, 
  Download, 
  Loader2, 
  Sparkles, 
  Layers, 
  Film, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const ReelVoiceoverStudio: React.FC = () => {
  const [script, setScript] = useState<string>(DEFAULT_REEL_SCRIPT);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(REEL_VOICES[0]); // Fenrir default
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Bench of 3 voices for comparison (Section 14 & 15)
  const [benchVoices, setBenchVoices] = useState<MultiVoiceAudition[]>([
    {
      voiceName: 'Fenrir',
      label: 'Voice A (Conversational Default)',
      audioBase64: null,
      rawPcm: null,
      audioBuffer: null,
      isLoading: false,
      isPlaying: false,
      error: null,
      durationSeconds: 0,
    },
    {
      voiceName: 'Enceladus',
      label: 'Voice B (Athletic & Energetic)',
      audioBase64: null,
      rawPcm: null,
      audioBuffer: null,
      isLoading: false,
      isPlaying: false,
      error: null,
      durationSeconds: 0,
    },
    {
      voiceName: 'Puck',
      label: 'Voice C (Young & Casual)',
      audioBase64: null,
      rawPcm: null,
      audioBuffer: null,
      isLoading: false,
      isPlaying: false,
      error: null,
      durationSeconds: 0,
    },
  ]);

  // Audio Playback state
  const [activePlayingVoice, setActivePlayingVoice] = useState<string | null>(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);
  const [isSynthesizingAll, setIsSynthesizingAll] = useState<boolean>(false);
  const [isOptimizingLength, setIsOptimizingLength] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Modals
  const [showAnalyzerModal, setShowAnalyzerModal] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showDaVinciModal, setShowDaVinciModal] = useState<boolean>(false);
  const [isAnalyzingScript, setIsAnalyzingScript] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ScriptAnalysisResult | null>(null);

  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const playStartTimeRef = useRef<number>(0);
  const playbackTimerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      isMountedRef.current = false;
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, [isDarkMode]);

  // Computed words and characters
  const words = useMemo(() => {
    return script.replace(/\[[^\]]+\]/g, '').trim().split(/\s+/).filter(Boolean);
  }, [script]);

  const wordCount = words.length;
  const charCount = script.length;
  const estimatedSeconds = Math.max(1, Math.round(wordCount / 2.6)); // Energetic Reel speed

  const stopAudio = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    setActivePlayingVoice(null);
    setCurrentPlaybackTime(0);
  };

  const notify = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      if (isMountedRef.current) setStatusNotification(null);
    }, 3500);
  };

  // Synthesize a single voice (e.g. Fenrir or selected)
  const synthesizeVoice = async (voiceName: string): Promise<Uint8Array | null> => {
    setBenchVoices((prev) =>
      prev.map((v) => (v.voiceName === voiceName ? { ...v, isLoading: true, error: null } : v))
    );

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          voiceName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to synthesize speech');
      }

      const data = await response.json();
      if (!isMountedRef.current) return null;

      const rawPcm = decodeBase64(data.audio);

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const buffer = await decodeAudioData(rawPcm, audioContextRef.current, 24000);

      setBenchVoices((prev) =>
        prev.map((v) =>
          v.voiceName === voiceName
            ? {
                ...v,
                audioBase64: data.audio,
                rawPcm,
                audioBuffer: buffer,
                isLoading: false,
                durationSeconds: buffer.duration,
              }
            : v
        )
      );

      notify(`Synthesized natural Reel audio for ${voiceName}!`);
      return rawPcm;
    } catch (err: any) {
      console.error(`Synthesis error for ${voiceName}:`, err);
      setBenchVoices((prev) =>
        prev.map((v) =>
          v.voiceName === voiceName
            ? { ...v, isLoading: false, error: err.message || 'Synthesis failed' }
            : v
        )
      );
      return null;
    }
  };

  // Play / Pause toggle for a specific voice
  const handlePlayToggle = async (voiceName: string) => {
    if (activePlayingVoice === voiceName) {
      stopAudio();
      return;
    }

    stopAudio();

    let targetAudition = benchVoices.find((v) => v.voiceName === voiceName);
    let buffer = targetAudition?.audioBuffer;

    if (!buffer) {
      const pcm = await synthesizeVoice(voiceName);
      if (!pcm || !audioContextRef.current) return;
      buffer = await decodeAudioData(pcm, audioContextRef.current, 24000);
    }

    if (!buffer) return;

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    } else if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackSpeed;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      if (isMountedRef.current) {
        stopAudio();
      }
    };

    sourceNodeRef.current = source;
    source.start();
    setActivePlayingVoice(voiceName);
    playStartTimeRef.current = Date.now();

    playbackTimerRef.current = setInterval(() => {
      if (buffer) {
        const elapsed = ((Date.now() - playStartTimeRef.current) / 1000) * playbackSpeed;
        if (elapsed >= buffer.duration) {
          stopAudio();
        } else {
          setCurrentPlaybackTime(elapsed);
        }
      }
    }, 100);
  };

  // Audition all 3 voices in the bench
  const handleSynthesizeAll = async () => {
    setIsSynthesizingAll(true);
    notify('Synthesizing Voice A, B, and C in parallel for comparison...');
    try {
      await Promise.all(benchVoices.map((v) => synthesizeVoice(v.voiceName)));
      notify('All 3 Reel voices ready for audition comparison!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizingAll(false);
    }
  };

  // Download 24kHz WAV
  const handleDownloadWav = (voiceName: string) => {
    const target = benchVoices.find((v) => v.voiceName === voiceName);
    if (!target?.rawPcm) {
      notify(`Synthesizing ${voiceName} before download...`);
      synthesizeVoice(voiceName).then((pcm) => {
        if (pcm) {
          downloadWav(pcm, `reel-voiceover-${voiceName.toLowerCase()}-24khz.wav`, 24000);
        }
      });
      return;
    }
    downloadWav(target.rawPcm, `reel-voiceover-${voiceName.toLowerCase()}-24khz.wav`, 24000);
    notify(`Downloaded clean 24kHz WAV (${voiceName}) ready for DaVinci Resolve!`);
  };

  // Optimize Reel Duration
  const handleOptimizeLength = async (target: '15-20' | '20-30' | '30-40') => {
    setIsOptimizingLength(true);
    notify(`Optimizing script for ${target}s Reel pacing...`);
    try {
      const res = await fetch('/api/optimize-length', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, targetRange: target }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.optimizedScript) {
          setScript(data.optimizedScript);
          notify(`Optimized for ${target}s Reel (${data.wordCount} words)!`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizingLength(false);
    }
  };

  // Run Script Analyzer
  const handleRunAnalysis = async () => {
    setIsAnalyzingScript(true);
    try {
      const res = await fetch('/api/analyze-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingScript(false);
    }
  };

  const handleOpenAnalyzer = () => {
    setShowAnalyzerModal(true);
    if (!analysisResult) {
      handleRunAnalysis();
    }
  };

  // Active voice audio buffer duration
  const activeAudition = benchVoices.find((v) => v.voiceName === (activePlayingVoice || selectedVoice.name));
  const activeDuration = activeAudition?.durationSeconds || estimatedSeconds;

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden font-sans select-none antialiased">
      
      {/* Top Header Bar */}
      <HeaderBar
        selectedVoice={selectedVoice}
        onSelectVoice={(v) => {
          setSelectedVoice(v);
          // If the selected voice isn't in bench, put it into slot 0
          if (!benchVoices.some((b) => b.voiceName === v.name)) {
            setBenchVoices((prev) => [
              {
                voiceName: v.name,
                label: `Voice A (${v.name})`,
                audioBase64: null,
                rawPcm: null,
                audioBuffer: null,
                isLoading: false,
                isPlaying: false,
                error: null,
                durationSeconds: 0,
              },
              prev[1],
              prev[2],
            ]);
          }
        }}
        voices={REEL_VOICES}
        onOpenVideoSync={() => setShowVideoModal(true)}
        onOpenDaVinciGuide={() => setShowDaVinciModal(true)}
        onOpenAnalyzer={handleOpenAnalyzer}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        wordCount={wordCount}
        estimatedSeconds={estimatedSeconds}
      />

      {/* Main 3-Column Creator Workspace */}
      <main className="flex-1 overflow-hidden p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 min-h-0">
        
        {/* LEFT COLUMN: Script Editor (4 cols) */}
        <section className="lg:col-span-4 h-full min-h-0 flex flex-col">
          <ScriptEditor
            script={script}
            onChangeScript={setScript}
            wordCount={wordCount}
            charCount={charCount}
            estimatedSeconds={estimatedSeconds}
            onOptimizeLength={handleOptimizeLength}
            isOptimizing={isOptimizingLength}
            onOpenAnalyzer={handleOpenAnalyzer}
          />
        </section>

        {/* CENTER COLUMN: Audio Bench & Multi-Voice Comparison (5 cols) */}
        <section className="lg:col-span-5 h-full min-h-0 flex flex-col">
          <AudioBench
            primaryVoice={selectedVoice}
            benchVoices={benchVoices}
            activePlayingVoice={activePlayingVoice}
            onPlayToggle={handlePlayToggle}
            onSynthesizeVoice={(name) => {
              synthesizeVoice(name);
            }}
            onSynthesizeAll={handleSynthesizeAll}
            isSynthesizingAll={isSynthesizingAll}
            onDownloadWav={handleDownloadWav}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={(spd) => {
              setPlaybackSpeed(spd);
              if (sourceNodeRef.current) {
                sourceNodeRef.current.playbackRate.value = spd;
              }
            }}
            currentPlaybackTime={currentPlaybackTime}
            durationSeconds={activeDuration}
            onOpenDaVinciGuide={() => setShowDaVinciModal(true)}
          />
        </section>

        {/* RIGHT COLUMN: Performance Guide & Delivery Controls (3 cols) */}
        <section className="lg:col-span-3 h-full min-h-0 flex flex-col">
          <PerformanceGuide
            analysis={analysisResult}
            onOpenAnalyzer={handleOpenAnalyzer}
            onOpenDaVinciGuide={() => setShowDaVinciModal(true)}
          />
        </section>

      </main>

      {/* Floating Action Notifications */}
      {statusNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 text-zinc-100 px-4 py-2 rounded-full border border-indigo-500/40 shadow-2xl flex items-center gap-2 text-xs font-medium backdrop-blur-md animate-slide-up">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      <footer className="w-full bg-zinc-950/95 border-t border-zinc-800/80 px-4 lg:px-6 py-2.5 shrink-0 z-30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
          <span>Voice: <strong className="text-zinc-200">{selectedVoice.name}</strong></span>
          <span className="text-zinc-600">•</span>
          <span>Target: <strong className="text-amber-400">Indian Hinglish Gym-Talk</strong></span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">Format: <strong className="text-indigo-400">24kHz WAV (Flat EQ)</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {/* Primary Play / Audition */}
          <button
            onClick={() => handlePlayToggle(selectedVoice.name)}
            disabled={benchVoices.find((v) => v.voiceName === selectedVoice.name)?.isLoading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/25 active:scale-95 disabled:opacity-50"
          >
            {benchVoices.find((v) => v.voiceName === selectedVoice.name)?.isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : activePlayingVoice === selectedVoice.name ? (
              <Square size={14} className="fill-current" />
            ) : (
              <Play size={14} className="fill-current" />
            )}
            <span>
              {activePlayingVoice === selectedVoice.name
                ? 'Stop Performance'
                : `Audition ${selectedVoice.name}`}
            </span>
          </button>

          {/* Download Clean WAV */}
          <button
            onClick={() => handleDownloadWav(selectedVoice.name)}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold border border-zinc-700 transition-colors"
            title="Download clean 24kHz WAV for DaVinci Resolve"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export WAV</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      {showAnalyzerModal && (
        <ScriptAnalyzerModal
          script={script}
          analysis={analysisResult}
          isLoading={isAnalyzingScript}
          onApplySuggestedScript={(newScript) => {
            setScript(newScript);
            notify('Polished Hinglish script applied to editor!');
          }}
          onClose={() => setShowAnalyzerModal(false)}
          onRunAnalysis={handleRunAnalysis}
        />
      )}

      {showVideoModal && (
        <VisualTimelineModal
          script={script}
          onClose={() => setShowVideoModal(false)}
        />
      )}

      {showDaVinciModal && (
        <DaVinciWorkflowModal
          onClose={() => setShowDaVinciModal(false)}
          onDownloadActiveWav={() => handleDownloadWav(selectedVoice.name)}
          hasAudio={!!benchVoices.find((v) => v.voiceName === selectedVoice.name)?.rawPcm}
          voiceName={selectedVoice.name}
        />
      )}

    </div>
  );
};
