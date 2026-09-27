/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Upload, 
  X, 
  Play, 
  Pause, 
  Film, 
  Clock, 
  Sparkles, 
  Loader2, 
  Dumbbell, 
  Lightbulb,
  Check
} from 'lucide-react';
import { VideoTimelineItem } from '../../types/reel';

interface VisualTimelineModalProps {
  script: string;
  onClose: () => void;
}

export const VisualTimelineModal: React.FC<VisualTimelineModalProps> = ({ script, onClose }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(24);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [timeline, setTimeline] = useState<VideoTimelineItem[]>([
    {
      timeRange: '00:00 – 00:03',
      shotType: 'Camera-Facing Hook',
      visualAction: 'Standing by cable station, looking at camera casually before walking to the machine.',
      voiceSegment: '[conversational] A few days ago, I gave myself a small challenge —',
      directorTip: 'Start mid-movement to catch scrolling attention within the first 1.5 seconds.',
    },
    {
      timeRange: '00:03 – 00:08',
      shotType: 'Setup & Pinning the Stack',
      visualAction: 'Close-up of hands pinning the full 91kg stack, gripping the rope or bar attachment.',
      voiceSegment: 'कि अपने birthday पर full-stack tricep pushdown की एक clean rep निकालनी है. But today, I changed the challenge a little.',
      directorTip: 'Show weight stack numbers clearly so the viewer registers the scale of the lift.',
    },
    {
      timeRange: '00:08 – 00:14',
      shotType: 'Adding Plate & Main Execution',
      visualAction: 'Adding the extra 10kg plate on top of the pin. Taking initial brace and starting first clean rep.',
      voiceSegment: 'Full stack की जगह, I wanted to hit a hundred kilos...',
      directorTip: 'Maintain side-profile angle to showcase clean elbow lockout and minimal body swing.',
    },
    {
      timeRange: '00:14 – 00:19',
      shotType: 'Peak Struggle & 2nd Rep',
      visualAction: 'Controlling eccentric negative, pushing through second rep cleanly with high tension.',
      voiceSegment: 'और one rep की जगह, I actually got two clean, controlled reps.',
      directorTip: 'Hold the peak contraction at the bottom for half a second to demonstrate true control.',
    },
    {
      timeRange: '00:19 – 00:24',
      shotType: 'Reaction & Birthday Payoff',
      visualAction: 'Letting weight down with controlled speed, turning back to camera with genuine, tired smile.',
      voiceSegment: "[small proud smile] And honestly... I think that's a pretty good birthday gift.",
      directorTip: 'Cut right after the final smile; don’t let dead air linger at the end of the Reel.',
    },
  ]);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Generate dynamic AI timeline if requested
  const handleGenerateTimeline = async () => {
    setIsLoadingTimeline(true);
    try {
      const res = await fetch('/api/video-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, videoDuration }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.timeline && data.timeline.length > 0) {
          setTimeline(data.timeline);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md animate-fade-in text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-sync-title"
    >
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-slide-up">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Film size={18} />
            </div>
            <div>
              <h2 id="video-sync-title" className="text-base font-bold text-white">
                Visual-Aware Script Mode & Reel Timeline
              </h2>
              <p className="text-xs text-zinc-400">
                Synchronize voiceover cues to gym footage shot-by-shot (VISUAL → STORY → SCRIPT → AUDIO).
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

        {/* Content Split: Left Video Preview / Right Timeline */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar text-xs">
          
          {/* Left: Video Canvas / Upload (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="aspect-[9/16] max-h-[440px] mx-auto bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden flex items-center justify-center group shadow-xl">
              
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => {
                      if (videoRef.current) setVideoDuration(videoRef.current.duration);
                    }}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                  />

                  {/* Play/Pause Overlay */}
                  <div 
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white">
                      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </div>
                  </div>

                  {/* Synchronized Teleprompter Caption Overlay */}
                  <div className="absolute bottom-6 inset-x-4 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center font-sans">
                    <p className="text-xs font-semibold text-amber-300 leading-relaxed">
                      {timeline[Math.min(timeline.length - 1, Math.floor((currentTime / Math.max(1, videoDuration)) * timeline.length))]?.voiceSegment || script.slice(0, 70)}
                    </p>
                  </div>
                </>
              ) : (
                /* Empty state with upload button */
                <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                    <Video size={28} />
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-300 block mb-1">
                      Upload Reel Footage (9:16)
                    </span>
                    <p className="text-[11px] text-zinc-500">
                      MP4 or MOV fitness clip to sync visual events with voice timing
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
                  >
                    <Upload size={14} />
                    <span>Choose Video File</span>
                  </button>
                </div>
              )}

            </div>

            {/* Video Sync Stats */}
            {videoUrl && (
              <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-400 font-mono text-[11px]">
                <span>Time: {currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-violet-400 hover:text-violet-300 text-[10px]"
                >
                  Change Video
                </button>
              </div>
            )}

          </div>

          {/* Right: Visual Timeline Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                Synchronized Shot Sequence:
              </span>

              <button
                onClick={handleGenerateTimeline}
                disabled={isLoadingTimeline}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium flex items-center gap-1"
              >
                {isLoadingTimeline ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-amber-400" />}
                <span>Auto-Sync to Script</span>
              </button>
            </div>

            {/* Timeline Cards */}
            <div className="space-y-2.5">
              {timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {item.timeRange}
                    </span>
                    <span className="text-xs font-bold text-zinc-200">
                      {item.shotType}
                    </span>
                  </div>

                  <div className="text-zinc-300 font-medium text-xs leading-relaxed">
                    👁️ <strong>Visual:</strong> {item.visualAction}
                  </div>

                  <div className="text-indigo-300 bg-indigo-950/30 p-2 rounded-xl border border-indigo-900/30 text-xs italic">
                    🎙️ <strong>Voice:</strong> "{item.voiceSegment}"
                  </div>

                  <div className="text-[11px] text-zinc-400 flex items-start gap-1">
                    <Lightbulb size={12} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{item.directorTip}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            Export the synthesized voiceover to match these exact visual markers in DaVinci Resolve.
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
