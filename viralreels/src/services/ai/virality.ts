// ViralReels - AI Virality Analysis Service
// Last updated: 2026-01-19

import Anthropic from '@anthropic-ai/sdk';
import { VideoTranscript, ViralityAnalysis, ViralitySegment, ViralitySignal } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Analyze video transcript for virality potential
 */
export async function analyzeViralityFromTranscript(
  transcript: VideoTranscript,
  videoDuration: number
): Promise<ViralityAnalysis> {
  const prompt = buildAnalysisPrompt(transcript, videoDuration);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse la réponse JSON de Claude
    const analysis = parseClaudeResponse(responseText);

    return analysis;
  } catch (error) {
    console.error('Error analyzing virality:', error);
    throw error;
  }
}

/**
 * Build the analysis prompt for Claude
 */
function buildAnalysisPrompt(transcript: VideoTranscript, videoDuration: number): string {
  return `Tu es un expert en contenu viral pour les réseaux sociaux (TikTok, Instagram Reels, YouTube Shorts).

Analyse cette transcription de vidéo YouTube et identifie les meilleurs moments pour créer des clips viraux de 10-60 secondes.

TRANSCRIPTION:
${JSON.stringify(transcript.segments, null, 2)}

DURÉE TOTALE: ${videoDuration} secondes

CRITÈRES DE VIRALITÉ:
1. Hooks accrocheurs (questions, affirmations choquantes, "comment", "pourquoi", "secret")
2. Moments émotionnels forts (rire, surprise, révélation)
3. Punchlines ou citations mémorables
4. Transitions naturelles pour découpage
5. Phrases courtes et impactantes
6. Appels à l'action ou questions rhétoriques

CONSIGNES:
- Identifie 5-10 segments à fort potentiel viral
- Pour chaque segment, donne un score de viralité (0-100)
- Explique les raisons du score (hooks, émotion, impact)
- Suggère une durée optimale pour le clip (10-60 sec)
- Assure-toi que les segments commencent et finissent sur des phrases complètes

RÉPONDS UNIQUEMENT EN JSON avec cette structure:
{
  "overallScore": 0-100,
  "segments": [
    {
      "startTime": secondes,
      "endTime": secondes,
      "score": 0-100,
      "reasons": ["raison1", "raison2"],
      "signals": [
        {
          "type": "textual" | "audio" | "visual",
          "name": "hook" | "emotion" | "question" | "punchline",
          "confidence": 0-1,
          "timestamp": secondes,
          "description": "description"
        }
      ],
      "suggestedClipDuration": secondes
    }
  ],
  "recommendations": {
    "bestMoments": [{"start": secondes, "end": secondes}],
    "suggestedHooks": ["hook1", "hook2"],
    "platformOptimizations": {
      "tiktok": ["conseil1", "conseil2"],
      "instagram": ["conseil1", "conseil2"],
      "youtube": ["conseil1", "conseil2"]
    }
  }
}`;
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(responseText: string): ViralityAnalysis {
  try {
    // Extraire le JSON de la réponse
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as ViralityAnalysis;
  } catch (error) {
    console.error('Error parsing Claude response:', error);

    // Fallback: retourner une analyse basique
    return {
      overallScore: 50,
      segments: [],
      recommendations: {
        bestMoments: [],
        suggestedHooks: [],
        platformOptimizations: {
          tiktok: ['Utiliser des hooks accrocheurs'],
          instagram: ['Ajouter des sous-titres'],
          youtube: ['Optimiser les 3 premières secondes'],
        },
      },
    };
  }
}

/**
 * Analyze audio features (à implémenter avec un service d'analyse audio)
 */
export async function analyzeAudioFeatures(audioUrl: string): Promise<ViralitySignal[]> {
  // TODO: Implémenter l'analyse audio
  // - Détection de pics d'énergie vocale
  // - Détection de rires/réactions
  // - Changements de ton
  // Pour l'instant, retourne un tableau vide
  return [];
}

/**
 * Combine multiple analysis signals
 */
export function combineAnalysisSignals(
  transcriptAnalysis: ViralityAnalysis,
  audioSignals: ViralitySignal[]
): ViralityAnalysis {
  // Combine les signaux audio avec l'analyse de texte
  const enhancedSegments = transcriptAnalysis.segments.map(segment => {
    const relevantAudioSignals = audioSignals.filter(
      signal => signal.timestamp >= segment.startTime && signal.timestamp <= segment.endTime
    );

    const audioBoost = relevantAudioSignals.reduce((boost, signal) => {
      return boost + signal.confidence * 10; // Max +10 points par signal
    }, 0);

    return {
      ...segment,
      score: Math.min(100, segment.score + audioBoost),
      signals: [...segment.signals, ...relevantAudioSignals],
    };
  });

  return {
    ...transcriptAnalysis,
    segments: enhancedSegments,
  };
}

/**
 * Estimate analysis cost
 */
export function estimateAnalysisCost(transcriptLength: number): number {
  // Claude pricing: ~$3/million input tokens, ~$15/million output tokens
  // Approximation: 1000 chars ≈ 250 tokens
  const inputTokens = (transcriptLength / 4) + 1000; // transcript + prompt
  const outputTokens = 2000; // JSON response estimé

  const inputCost = (inputTokens / 1000000) * 3;
  const outputCost = (outputTokens / 1000000) * 15;

  return inputCost + outputCost;
}
