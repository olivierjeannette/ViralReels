// ViralReels - Utility Functions
// Last updated: 2026-01-19

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Plan } from '@prisma/client';
import { PLAN_LIMITS, VideoQuality } from '@/types';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse duration string (HH:MM:SS or MM:SS) to seconds
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return 0;
}

/**
 * Get plan limits for a given plan
 */
export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan];
}

/**
 * Check if user can upload video based on plan limits
 */
export function canUploadVideo(
  plan: Plan,
  videosThisMonth: number,
  fileSize: number,
  duration: number
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(plan);

  if (videosThisMonth >= limits.videosPerMonth) {
    return {
      allowed: false,
      reason: `Quota mensuel atteint (${limits.videosPerMonth} vidéos/mois)`,
    };
  }

  if (fileSize > limits.maxVideoSize) {
    return {
      allowed: false,
      reason: `Fichier trop volumineux (max: ${formatBytes(limits.maxVideoSize)})`,
    };
  }

  if (duration > limits.maxVideoDuration) {
    return {
      allowed: false,
      reason: `Vidéo trop longue (max: ${formatDuration(limits.maxVideoDuration)})`,
    };
  }

  return { allowed: true };
}

/**
 * Check if quality is allowed for plan
 */
export function isQualityAllowed(plan: Plan, quality: VideoQuality): boolean {
  const limits = getPlanLimits(plan);

  const qualityOrder: VideoQuality[] = ['HD', '2K', '4K', '8K'];
  const maxQualityIndex = qualityOrder.indexOf(limits.maxQuality);
  const requestedQualityIndex = qualityOrder.indexOf(quality);

  return requestedQualityIndex <= maxQualityIndex;
}

/**
 * Get video resolution dimensions
 */
export function getResolutionDimensions(quality: VideoQuality, aspectRatio: string): { width: number; height: number } {
  const resolutions: Record<VideoQuality, { '16:9': [number, number]; '9:16': [number, number] }> = {
    HD: {
      '16:9': [1920, 1080],
      '9:16': [1080, 1920],
    },
    '2K': {
      '16:9': [2560, 1440],
      '9:16': [1440, 2560],
    },
    '4K': {
      '16:9': [3840, 2160],
      '9:16': [2160, 3840],
    },
    '8K': {
      '16:9': [7680, 4320],
      '9:16': [4320, 7680],
    },
  };

  const ratio = aspectRatio === '9:16' ? '9:16' : '16:9';
  const [width, height] = resolutions[quality][ratio];

  return { width, height };
}

/**
 * Calculate upload ETA
 */
export function calculateETA(bytesUploaded: number, bytesTotal: number, startTime: number): number {
  const elapsedTime = Date.now() - startTime;
  const uploadSpeed = bytesUploaded / elapsedTime; // bytes per ms
  const remainingBytes = bytesTotal - bytesUploaded;

  return (remainingBytes / uploadSpeed) / 1000; // seconds
}

/**
 * Validate video file type
 */
export function isValidVideoType(file: File): boolean {
  const validTypes = [
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/x-matroska', // .mkv
    'video/webm',
  ];

  return validTypes.includes(file.type);
}

/**
 * Generate a unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();

  return `${timestamp}-${random}.${extension}`;
}

/**
 * Format price in euros
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Get plan name display
 */
export function getPlanName(plan: Plan): string {
  const names: Record<Plan, string> = {
    FREE: 'Gratuit',
    CREATOR: 'Creator',
    PRO: 'Pro',
  };

  return names[plan];
}

/**
 * Get plan price
 */
export function getPlanPrice(plan: Plan): number {
  const prices: Record<Plan, number> = {
    FREE: 0,
    CREATOR: 9.99,
    PRO: 24.99,
  };

  return prices[plan];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;

  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2 } = options;

  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    await sleep(delay);

    return retry(fn, {
      retries: retries - 1,
      delay: delay * backoff,
      backoff,
    });
  }
}
