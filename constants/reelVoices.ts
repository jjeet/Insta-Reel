/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoiceOption } from '../types/reel';

export const REEL_VOICES: VoiceOption[] = [
  {
    id: 'Fenrir',
    name: 'Fenrir',
    label: 'Fenrir (Recommended Default)',
    gender: 'Male',
    pitch: 'Medium-Low',
    tone: 'Conversational, Warm, Authentic',
    description: 'Natural mid-30s conversational cadence, perfectly suited for Indian gym-talk and personal story flow.',
    recommendedFor: 'Primary Reel voiceover, authentic milestone recounting',
  },
  {
    id: 'Enceladus',
    name: 'Enceladus',
    label: 'Enceladus (High Energy Athletic)',
    gender: 'Male',
    pitch: 'Medium-Low',
    tone: 'Energetic, Confident, Motivating',
    description: 'Crisp forward drive, confident without arrogance, ideal for heavy lifts and breakthrough PRs.',
    recommendedFor: 'Heavy lift PRs, high-energy Reel hooks',
  },
  {
    id: 'Puck',
    name: 'Puck',
    label: 'Puck (Young & Casual)',
    gender: 'Male',
    pitch: 'Medium',
    tone: 'Young Adult, Approachable, Casual',
    description: 'Fast, lively delivery that feels like talking to a training partner between sets.',
    recommendedFor: 'Casual tips, relatable gym humor, daily workout stories',
  },
  {
    id: 'Orus',
    name: 'Orus',
    label: 'Orus (Firm & Direct)',
    gender: 'Male',
    pitch: 'Medium-Low',
    tone: 'Clear Articulation, Controlled, Firm',
    description: 'Clean enunciation of technical gym terms, controlled pacing with solid authority.',
    recommendedFor: 'Form breakdown, controlled repetition focus',
  },
  {
    id: 'Algieba',
    name: 'Algieba',
    label: 'Algieba (Warm & Enthusiastic)',
    gender: 'Male',
    pitch: 'Medium-Low',
    tone: 'Warm, Enthusiastic, Confident',
    description: 'Natural enthusiasm that keeps the listener engaged across the entire 30-second arc.',
    recommendedFor: 'Storytelling, transformation journeys',
  },
  {
    id: 'Alnilam',
    name: 'Alnilam',
    label: 'Alnilam (Upbeat & Optimistic)',
    gender: 'Male',
    pitch: 'Medium-High',
    tone: 'Young Adult, Optimistic, Vibrant',
    description: 'Slightly higher pitch with bright energy, great for quick, punchy 15-second Reels.',
    recommendedFor: 'Punchy 15s hooks, fast-paced transitions',
  },
  {
    id: 'Sadaltager',
    name: 'Sadaltager',
    label: 'Sadaltager (Calm & Grounded)',
    gender: 'Male',
    pitch: 'Medium-Low',
    tone: 'Calm, Approachable, Articulate',
    description: 'Steady pacing and thoughtful delivery for reflective, discipline-focused fitness content.',
    recommendedFor: 'Mindset reels, long-term discipline reflection',
  },
  {
    id: 'Charon',
    name: 'Charon',
    label: 'Charon (Deep & Resonant)',
    gender: 'Male',
    pitch: 'Low',
    tone: 'Deep, Resonant, Calm',
    description: 'Deep baritone with steady weight, useful for serious weight milestones.',
    recommendedFor: 'Heavy stack lifts, serious milestones',
  },
];

export const DEFAULT_REEL_SCRIPT = `[conversational] A few days ago, I gave myself a small challenge —
कि अपने birthday पर full-stack tricep pushdown की एक clean rep निकालनी है.

[slight pause]
But today, I changed the challenge a little.

Full stack की जगह,
I wanted to hit a hundred kilos...

और one rep की जगह,
I actually got two clean, controlled reps.

[small proud smile]
And honestly...
I think that's a pretty good birthday gift.`;
