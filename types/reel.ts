/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VoiceOption {
  id: string;
  name: string;
  label: string;
  gender: string;
  pitch: string;
  tone: string;
  description: string;
  recommendedFor: string;
}

export interface ScriptAnalysisResult {
  naturalnessScore: number;
  summary: string;
  pacingVerdict: string;
  wordCount: number;
  estimatedSeconds: number;
  pronunciationRisks: Array<{
    original: string;
    suggestion: string;
    reason: string;
  }>;
  suggestedScript: string;
  performanceGuide: Array<{
    segment: string;
    emotion: string;
    pacing: string;
    energy: string;
    pause: string;
    emphasisWords: string[];
    directorTip: string;
  }>;
}

export interface MultiVoiceAudition {
  voiceName: string;
  label: string; // e.g. "Voice A (Primary)"
  audioBase64: string | null;
  rawPcm: Uint8Array | null;
  audioBuffer: AudioBuffer | null;
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  durationSeconds: number;
}

export interface VideoTimelineItem {
  timeRange: string;
  shotType: string;
  visualAction: string;
  voiceSegment: string;
  directorTip: string;
}
