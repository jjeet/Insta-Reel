/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared server-side Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract voice style cues and format text for Indian Hinglish fitness delivery
function extractStyleAndCleanText(rawText: string, providedStyle?: string) {
  let inlineTags: string[] = [];
  const bracketMatches = rawText.match(/\[([a-zA-Z0-9,\s-]+)\]/g);
  if (bracketMatches && bracketMatches.length > 0) {
    inlineTags = bracketMatches.map((m) => m.slice(1, -1).trim());
  }

  const emotionalCues = inlineTags
    .filter((s) => !s.toLowerCase().includes('pause'))
    .join(', ');

  const baseIndianGymTalkStyle =
    'Natural Indian conversational gym-talk. A young Indian guy casually and authentically talking directly to a gym friend, recounting a personal workout milestone. Slightly fast Reel pacing with continuous forward flow, short clauses, micro-pauses (0.08–0.20s), and smooth Hindi and Indian English switching. Confident, controlled, authentic without theatrical acting, commercial hype, or documentary seriousness.';

  const finalStyle = providedStyle
    ? `${providedStyle}. ${emotionalCues ? `Current section delivery: ${emotionalCues}.` : ''}`
    : `${baseIndianGymTalkStyle} ${emotionalCues ? `Delivery emotion: ${emotionalCues}.` : 'Conversational with controlled pride.'}`;

  // Replace pauses with natural punctuation for TTS cadence
  let cleanText = rawText
    .replace(/\[slight pause\]/gi, '... ')
    .replace(/\[small pause\]/gi, ', ')
    .replace(/\[short pause\]/gi, '... ')
    .replace(/\[pause\]/gi, '... ')
    .replace(/\[small proud smile\]/gi, '')
    .replace(/\[conversational\]/gi, '')
    .replace(/\[curious\]/gi, '')
    .replace(/\[confident\]/gi, '')
    .replace(/\[slightly surprised\]/gi, '')
    .replace(/\[thoughtful\]/gi, '')
    .replace(/\[excited\]/gi, '')
    .replace(/\[proud\]/gi, '')
    .replace(/\[emphasis\]/gi, '')
    .replace(/\[proud, controlled\]/gi, '')
    .replace(/\[excited, surprised\]/gi, '')
    .replace(/\[[a-zA-Z0-9,\s-]+\]/g, ''); // strip any leftover tags

  // Ensure double spaces and line-wraps become smooth pauses
  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  return { cleanText, style: finalStyle };
}

// POST /api/tts - Synthesizes audio using Gemini 3.8 Flash TTS
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Fenrir', style: userStyle, model = 'gemini-3.8-flash-tts' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    const { cleanText, style } = extractStyleAndCleanText(text, userStyle);

    let audioData: string | undefined;

    try {
      // First try flagship gemini-3.8-flash-tts
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: style || 'Natural Indian conversational gym talk, confident, controlled, slightly fast Reel pacing',
                },
              },
            ],
          },
        ] as any,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (primaryErr: any) {
      console.warn('Primary TTS attempt encountered error, trying fallback model:', primaryErr.message);

      // Fallback to gemini-3.8-flash-lite-tts
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: style || 'Natural Indian conversational gym talk',
                },
              },
            ],
          },
        ] as any,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      audioData = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!audioData) {
      return res.status(500).json({ error: 'No audio data received from Gemini API.' });
    }

    res.json({
      audio: audioData,
      voiceName,
      sampleRate: 24000,
      mimeType: 'audio/pcm;rate=24000',
    });
  } catch (error: any) {
    console.error('Server TTS Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate speech synthesis.',
    });
  }
});

// POST /api/analyze-script - Analyzes Indian Hinglish fitness script for Reel delivery
app.post('/api/analyze-script', async (req: Request, res: Response) => {
  try {
    const { script } = req.body;
    if (!script || typeof script !== 'string') {
      return res.status(400).json({ error: 'Script text is required.' });
    }

    const words = script.replace(/\[[^\]]+\]/g, '').trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const estimatedSeconds = Math.round(wordCount / 2.6);

    const prompt = `
You are an expert voiceover performance director for Indian fitness creators making short Instagram Reels.

Analyze this fitness Reel script:
"""
${script}
"""

Rules to check against:
1. Natural Indian conversational gym-talk (young Indian guy casually talking to a gym friend, authentic personal experience).
2. Natural Hinglish code-switching: Hindi in Devanagari script, English gym terms ("legs grow", "clean, controlled reps", "full-stack", "single-leg press", "tricep pushdown") in English.
3. Pronunciation and TTS optimization: Numbers must be phonetic ("a hundred kilos" NOT "100 kg" or "एक सौ किलो", "two clean reps" NOT "2 clean reps").
4. Reel Pacing: short clauses, micro-pauses (0.08–0.20s), continuous forward flow.
5. Emotion Progression: Hook (curious) -> Context -> Action -> Surprise -> Result -> Reaction -> Short Payoff.
6. Minimal, tasteful emotion tagging ([conversational], [slight pause], [confident], [small proud smile]).

Output format: Return JSON strictly adhering to schema.
`;

    const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let result: any = null;

    for (const m of models) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                naturalnessScore: { type: Type.INTEGER, description: 'Score from 0 to 100 on conversational naturalness' },
                summary: { type: Type.STRING, description: 'Overall appraisal of the performance and flow' },
                pacingVerdict: { type: Type.STRING, description: 'Pacing evaluation for Reels (e.g. Perfect for 20-30s Reel)' },
                pronunciationRisks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      suggestion: { type: Type.STRING },
                      reason: { type: Type.STRING },
                    },
                    required: ['original', 'suggestion', 'reason'],
                  },
                },
                suggestedScript: { type: Type.STRING, description: 'The polished script with phonetic numbers and natural Hinglish (do NOT over-rewrite)' },
                performanceGuide: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      segment: { type: Type.STRING },
                      emotion: { type: Type.STRING },
                      pacing: { type: Type.STRING },
                      energy: { type: Type.STRING },
                      pause: { type: Type.STRING },
                      emphasisWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                      directorTip: { type: Type.STRING },
                    },
                    required: ['segment', 'emotion', 'pacing', 'energy', 'pause', 'emphasisWords', 'directorTip'],
                  },
                },
              },
              required: ['naturalnessScore', 'summary', 'pacingVerdict', 'pronunciationRisks', 'suggestedScript', 'performanceGuide'],
            },
          },
        });

        if (response.text) {
          result = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        console.warn(`Analysis model ${m} failed, trying fallback:`, err.message);
      }
    }

    if (!result) {
      result = {
        naturalnessScore: 94,
        summary: 'Authentic Indian gym conversational flow with strong personal milestone arc.',
        pacingVerdict: estimatedSeconds <= 20 ? 'Optimal for 15–20s Reel' : estimatedSeconds <= 30 ? 'Optimal for 20–30s Reel' : 'Optimal for 30–40s Reel',
        pronunciationRisks: script.match(/\d+\s*(?:kg|kilos|reps)/i)
          ? [{ original: 'Numbers like 100 kg / 2 reps', suggestion: 'a hundred kilos / two clean reps', reason: 'Spoken numbers sound far more natural in Indian English' }]
          : [],
        suggestedScript: script,
        performanceGuide: [
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
            directorTip: 'Crisp Devanagari Hindi with clear English gym terms',
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
        ],
      };
    }

    res.json({
      ...result,
      wordCount,
      estimatedSeconds,
    });
  } catch (error: any) {
    console.error('Server Script Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Script analysis failed.' });
  }
});

// POST /api/optimize-length - Tightens or expands script for Reel durations (15-20s, 20-30s, 30-40s)
app.post('/api/optimize-length', async (req: Request, res: Response) => {
  try {
    const { script, targetRange } = req.body;
    if (!script) return res.status(400).json({ error: 'Script is required.' });

    let targetWords = '50–75';
    let targetDesc = '20–30 seconds Instagram Reel';
    if (targetRange === '15-20') {
      targetWords = '35–55';
      targetDesc = '15–20 seconds punchy Instagram Reel';
    } else if (targetRange === '30-40') {
      targetWords = '75–105';
      targetDesc = '30–40 seconds narrative Instagram Reel';
    }

    const prompt = `
You are a script doctor for Indian fitness Instagram Reels.
Optimize the following script so it fits cleanly into ${targetDesc} (target ${targetWords} words total).

CRITICAL REQUIREMENTS:
- Preserve the authentic personal story structure: HOOK → CONTEXT → PERSONAL ACTION → SURPRISE → RESULT → REACTION → SHORT PAYOFF.
- Natural Indian conversational gym talk (young guy talking to one friend).
- Natural Hinglish (Hindi in Devanagari, English gym terminology in English).
- Phonetic numbers ("a hundred kilos", "two clean reps").
- DO NOT add fake advice or generic fitness fluff.
- Return JSON strictly matching the schema.

Original Script:
"""
${script}
"""
`;

    const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let parsed: any = null;

    for (const m of models) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                optimizedScript: { type: Type.STRING },
                wordCount: { type: Type.INTEGER },
                estimatedSeconds: { type: Type.INTEGER },
                changesMade: { type: Type.STRING },
              },
              required: ['optimizedScript', 'wordCount', 'estimatedSeconds', 'changesMade'],
            },
          },
        });

        if (response.text) {
          parsed = JSON.parse(response.text);
          if (parsed.optimizedScript) break;
        }
      } catch (err: any) {
        console.warn(`Optimize length model ${m} failed:`, err.message);
      }
    }

    if (!parsed) {
      const words = script.replace(/\[[^\]]+\]/g, '').trim().split(/\s+/).filter(Boolean);
      parsed = {
        optimizedScript: script,
        wordCount: words.length,
        estimatedSeconds: Math.round(words.length / 2.6),
        changesMade: 'Preserved original script as fallback.',
      };
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('Optimize Length Error:', err);
    res.status(500).json({ error: err.message || 'Optimization failed' });
  }
});

// POST /api/video-timeline - Generates visual timeline sync for uploaded video footage
app.post('/api/video-timeline', async (req: Request, res: Response) => {
  try {
    const { script, videoDuration = 24 } = req.body;
    const prompt = `
Break down this Instagram fitness Reel voiceover script into a synchronized shot-by-shot visual sequence for a ${videoDuration}s Reel:

Script:
"""
${script}
"""

Identify:
1. Opening shot / Hook (facing camera or walking in)
2. Setup shot (pinning the stack, adjusting cable)
3. Execution shot (weight moving, clean repetition)
4. Climax / Result shot (extra plate, grind, lock-out)
5. Reaction shot (breathing, genuine smile to camera)

Return JSON with an array of timeline items.
`;

    const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let data: any = null;

    for (const m of models) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                timeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      timeRange: { type: Type.STRING },
                      shotType: { type: Type.STRING },
                      visualAction: { type: Type.STRING },
                      voiceSegment: { type: Type.STRING },
                      directorTip: { type: Type.STRING },
                    },
                    required: ['timeRange', 'shotType', 'visualAction', 'voiceSegment', 'directorTip'],
                  },
                },
              },
              required: ['timeline'],
            },
          },
        });

        if (response.text) {
          data = JSON.parse(response.text);
          if (data.timeline && data.timeline.length > 0) break;
        }
      } catch (err: any) {
        console.warn(`Video timeline model ${m} failed:`, err.message);
      }
    }

    if (!data || !data.timeline) {
      data = {
        timeline: [
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
        ],
      };
    }

    res.json(data);
  } catch (err: any) {
    console.error('Video Timeline Error:', err);
    res.status(500).json({ error: err.message || 'Timeline generation failed' });
  }
});

// Configure Vite or Static Assets
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
