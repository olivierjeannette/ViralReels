// ViralReels - Deepgram Transcription Service
// Last updated: 2026-01-19

import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { VideoTranscript, TranscriptSegment, TranscriptWord } from '@/types';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY!;
const deepgram = createClient(deepgramApiKey);

/**
 * Transcribe a video using Deepgram
 */
export async function transcribeVideo(
  audioUrl: string,
  language: string = 'fr'
): Promise<VideoTranscript> {
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      {
        url: audioUrl,
      },
      {
        model: 'nova-3',
        language,
        punctuate: true,
        paragraphs: true,
        utterances: true,
        smart_format: true,
        diarize: false, // Speaker diarization - à activer si besoin
      }
    );

    if (error) {
      throw new Error(`Deepgram transcription error: ${error.message}`);
    }

    // Transformation au format VideoTranscript
    const segments: TranscriptSegment[] = [];
    let fullText = '';

    if (result.results?.utterances) {
      for (const utterance of result.results.utterances) {
        const words: TranscriptWord[] = utterance.words.map(word => ({
          word: word.word,
          start: word.start,
          end: word.end,
          confidence: word.confidence,
        }));

        segments.push({
          text: utterance.transcript,
          start: utterance.start,
          end: utterance.end,
          words,
        });

        fullText += utterance.transcript + ' ';
      }
    }

    return {
      language,
      segments,
      fullText: fullText.trim(),
    };
  } catch (error) {
    console.error('Error transcribing video:', error);
    throw error;
  }
}

/**
 * Extract audio from video URL and transcribe
 * Note: En production, l'extraction audio devrait être faite par le worker FFmpeg
 */
export async function transcribeFromVideoUrl(
  videoUrl: string,
  language: string = 'fr'
): Promise<VideoTranscript> {
  // Pour l'instant, on passe directement l'URL vidéo
  // Deepgram peut extraire l'audio automatiquement
  return transcribeVideo(videoUrl, language);
}

/**
 * Get supported languages for transcription
 */
export function getSupportedLanguages(): Array<{ code: string; name: string }> {
  return [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
  ];
}

/**
 * Estimate transcription cost
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  const durationMinutes = durationSeconds / 60;
  const costPerMinute = 0.0043; // Deepgram Nova-3 pricing
  return durationMinutes * costPerMinute;
}
