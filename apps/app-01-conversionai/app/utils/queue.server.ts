/**
 * Bull queue setup for async job processing
 * Uses Redis for job queue management
 */

import Bull from 'bull';
import { analyzeStore, type AnalyzeStoreJobData } from '../jobs/analyzeStore';
import { logger } from './logger.server';

// Redis configuration (Railway provides REDIS_URL)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create analysis queue
export const analysisQueue = new Bull('analysis', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
});

// Process analysis jobs
analysisQueue.process(async (job) => {
  logger.info(`[Queue] Processing analysis job ${job.id}`);

  try {
    const result = await analyzeStore(job.data as AnalyzeStoreJobData);
    logger.info(`[Queue] Job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    logger.error(`[Queue] Job ${job.id} failed:`, error);
    throw error;
  }
});

// Queue event handlers
analysisQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed with result:`, result);
});

analysisQueue.on('failed', (job, error) => {
  logger.error(`Job ${job?.id} failed:`, error);
});

analysisQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} has stalled`);
});

/**
 * Add analysis job to queue
 */
export async function queueAnalysis(data: AnalyzeStoreJobData) {
  const job = await analysisQueue.add(data, {
    priority: 1, // Higher priority = processed first
  });

  logger.info(`Analysis job queued: ${job.id} for shop ${data.shopDomain}`);
  return job;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const job = await analysisQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress();

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    result: job.returnvalue,
  };
}

/**
 * Clear all jobs (for development/testing)
 */
export async function clearQueue() {
  await analysisQueue.empty();
  logger.info('Analysis queue cleared');
}
