// ViralReels - BullMQ Queue Configuration
// Last updated: 2026-01-19

import { Queue, Worker, Job } from 'bullmq';
import { Redis } from '@upstash/redis';
import { Plan } from '@prisma/client';

// Configuration Redis
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
};

// ============== QUEUES ==============

export const videoQueue = new Queue('video-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const clipQueue = new Queue('clip-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// ============== JOB TYPES ==============

export interface VideoProcessingJob {
  videoId: string;
  userId: string;
  plan: Plan;
  videoUrl: string;
  filename: string;
}

export interface TranscriptionJob {
  videoId: string;
  videoUrl: string;
  language?: string;
}

export interface AnalysisJob {
  videoId: string;
  transcript: unknown;
  videoUrl: string;
}

export interface ClipGenerationJob {
  clipId: string;
  videoId: string;
  userId: string;
  plan: Plan;
  videoUrl: string;
  startTime: number;
  endTime: number;
  settings: unknown;
}

// ============== JOB PRIORITIES ==============

export function getPriority(plan: Plan): number {
  switch (plan) {
    case 'PRO':
      return 1; // Highest priority
    case 'CREATOR':
      return 2;
    case 'FREE':
      return 3; // Lowest priority
    default:
      return 3;
  }
}

// ============== ADD JOBS ==============

export async function addVideoProcessingJob(data: VideoProcessingJob) {
  const priority = getPriority(data.plan);

  return videoQueue.add('process-video', data, {
    priority,
    jobId: `video-${data.videoId}`,
  });
}

export async function addTranscriptionJob(data: TranscriptionJob) {
  return videoQueue.add('transcribe', data, {
    jobId: `transcribe-${data.videoId}`,
  });
}

export async function addAnalysisJob(data: AnalysisJob) {
  return videoQueue.add('analyze', data, {
    jobId: `analyze-${data.videoId}`,
  });
}

export async function addClipGenerationJob(data: ClipGenerationJob) {
  const priority = getPriority(data.plan);

  return clipQueue.add('generate-clip', data, {
    priority,
    jobId: `clip-${data.clipId}`,
  });
}

// ============== JOB STATUS ==============

export async function getJobStatus(jobId: string, queueName: 'video-processing' | 'clip-generation') {
  const queue = queueName === 'video-processing' ? videoQueue : clipQueue;
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress as number;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}

// ============== UTILITIES ==============

export async function getQueueStats(queueName: 'video-processing' | 'clip-generation') {
  const queue = queueName === 'video-processing' ? videoQueue : clipQueue;

  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
}

export async function clearQueue(queueName: 'video-processing' | 'clip-generation') {
  const queue = queueName === 'video-processing' ? videoQueue : clipQueue;
  await queue.drain();
}
