// ViralReels - Global TypeScript Types
// Last updated: 2026-01-19

import { Plan, VideoStatus, ClipStatus, JobStatus, JobType } from '@prisma/client';

// ============== PLAN LIMITS ==============

export interface PlanLimits {
  videosPerMonth: number;
  maxVideoSize: number; // bytes
  maxVideoDuration: number; // seconds
  maxQuality: VideoQuality;
  canExport4K: boolean;
  canExport8K: boolean;
  canTranslate: boolean;
  maxClipsPerVideo: number;
  processingPriority: number; // 1 = highest
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    videosPerMonth: 1,
    maxVideoSize: 500 * 1024 * 1024, // 500 MB
    maxVideoDuration: 30 * 60, // 30 min
    maxQuality: 'HD',
    canExport4K: false,
    canExport8K: false,
    canTranslate: false,
    maxClipsPerVideo: 5,
    processingPriority: 3,
  },
  CREATOR: {
    videosPerMonth: 20,
    maxVideoSize: 5 * 1024 * 1024 * 1024, // 5 GB
    maxVideoDuration: 3 * 60 * 60, // 3h
    maxQuality: '4K',
    canExport4K: true,
    canExport8K: false,
    canTranslate: true,
    maxClipsPerVideo: 10,
    processingPriority: 2,
  },
  PRO: {
    videosPerMonth: 999999, // Illimité
    maxVideoSize: 20 * 1024 * 1024 * 1024, // 20 GB
    maxVideoDuration: 10 * 60 * 60, // 10h
    maxQuality: '8K',
    canExport4K: true,
    canExport8K: true,
    canTranslate: true,
    maxClipsPerVideo: 20,
    processingPriority: 1,
  },
};

// ============== VIDEO TYPES ==============

export type VideoQuality = 'HD' | '2K' | '4K' | '8K';
export type VideoFormat = 'mp4' | 'mkv' | 'mov' | 'webm';
export type VideoCodec = 'h264' | 'h265' | 'vp9';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export interface VideoMetadata {
  filename: string;
  duration: number;
  resolution: string;
  fileSize: number;
  codec?: string;
  fps?: number;
  aspectRatio?: string;
}

export interface TranscriptWord {
  word: string;
  start: number; // seconds
  end: number; // seconds
  confidence: number; // 0-1
}

export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
  words: TranscriptWord[];
}

export interface VideoTranscript {
  language: string;
  segments: TranscriptSegment[];
  fullText: string;
}

// ============== VIRALITY ANALYSIS ==============

export interface ViralitySignal {
  type: 'textual' | 'audio' | 'visual';
  name: string;
  confidence: number; // 0-1
  timestamp: number;
  description: string;
}

export interface ViralitySegment {
  startTime: number;
  endTime: number;
  score: number; // 0-100
  reasons: string[];
  signals: ViralitySignal[];
  suggestedClipDuration: number;
}

export interface ViralityAnalysis {
  overallScore: number; // 0-100
  segments: ViralitySegment[];
  recommendations: {
    bestMoments: Array<{ start: number; end: number }>;
    suggestedHooks: string[];
    platformOptimizations: {
      tiktok: string[];
      instagram: string[];
      youtube: string[];
    };
  };
}

// ============== CLIP SETTINGS ==============

export interface SubtitleStyle {
  font: string;
  size: 'small' | 'medium' | 'large';
  color: string; // hex
  backgroundColor: string; // hex with alpha
  position: 'top' | 'center' | 'bottom';
  animation: 'none' | 'fade' | 'typewriter' | 'highlight';
}

export interface SubtitleSettings {
  enabled: boolean;
  style: SubtitleStyle;
  languages: {
    original: string;
    translations?: string[];
  };
}

export interface ClipSettings {
  duration: {
    min: number;
    max: number;
    target: number;
  };
  format: {
    aspectRatio: AspectRatio;
    orientation: 'vertical' | 'horizontal' | 'square';
  };
  subtitles: SubtitleSettings;
  export: {
    quality: VideoQuality;
    format: VideoFormat;
    codec: VideoCodec;
  };
}

export const DEFAULT_CLIP_SETTINGS: ClipSettings = {
  duration: {
    min: 10,
    max: 60,
    target: 30,
  },
  format: {
    aspectRatio: '9:16',
    orientation: 'vertical',
  },
  subtitles: {
    enabled: true,
    style: {
      font: 'Montserrat',
      size: 'medium',
      color: '#FFFFFF',
      backgroundColor: '#000000CC',
      position: 'bottom',
      animation: 'none',
    },
    languages: {
      original: 'fr',
    },
  },
  export: {
    quality: 'HD',
    format: 'mp4',
    codec: 'h264',
  },
};

// ============== API RESPONSES ==============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============== UPLOAD ==============

export interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
}

// ============== PROCESSING ==============

export interface ProcessingProgress {
  jobId: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0-100
  message?: string;
  estimatedTimeRemaining?: number; // seconds
}

// ============== DASHBOARD ==============

export interface DashboardStats {
  totalVideos: number;
  totalClips: number;
  videosThisMonth: number;
  quotaRemaining: number;
  storageUsed: number; // bytes
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  videosProcessed: number;
  clipsGenerated: number;
  revenueThisMonth: number;
}

// ============== PROMO CODES ==============

export interface PromoCodeValidation {
  valid: boolean;
  code?: string;
  discountType?: string;
  discountValue?: number;
  error?: string;
}

// ============== NOTIFICATIONS ==============

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// ============== FORM VALIDATION ==============

export interface ValidationError {
  field: string;
  message: string;
}

// ============== PAYMENT ==============

export interface SubscriptionDetails {
  plan: Plan;
  status: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  priceId?: string;
  customerId?: string;
}
