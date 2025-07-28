import cron, { ScheduledTask } from 'node-cron';
import { logger } from './logger';

export interface CronJob {
  name: string;
  schedule: string;
  task: () => Promise<void> | void;
  enabled?: boolean;
  timezone?: string;
}

export class CronService {
  private jobs: Map<string, ScheduledTask> = new Map();

  /**
   * Schedule a new cron job
   * @param job - The cron job configuration
   */
  scheduleJob(job: CronJob): void {
    if (this.jobs.has(job.name)) {
      logger.warn(`Cron job '${job.name}' already exists. Stopping previous instance.`);
      this.stopJob(job.name);
    }

    try {
      const task = cron.schedule(
        job.schedule,
        () => {
          (async () => {
            try {
              logger.info(`Starting cron job: ${job.name}`);
              await job.task();
              logger.info(`Completed cron job: ${job.name}`);
            } catch (error) {
              logger.error(`Error in cron job '${job.name}':`, error);
            }
          })();
        },
        {
          timezone: job.timezone || 'UTC',
        }
      );

      this.jobs.set(job.name, task);
      logger.info(`Scheduled cron job '${job.name}' with schedule: ${job.schedule}`);
    } catch (error) {
      logger.error(`Failed to schedule cron job '${job.name}':`, error);
      throw error;
    }
  }

  /**
   * Stop a specific cron job
   * @param jobName - The name of the job to stop
   */
  stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      logger.info(`Stopped cron job: ${jobName}`);
    } else {
      logger.warn(`Cron job '${jobName}' not found`);
    }
  }

  /**
   * Start a specific cron job
   * @param jobName - The name of the job to start
   */
  startJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      logger.info(`Started cron job: ${jobName}`);
    } else {
      logger.warn(`Cron job '${jobName}' not found`);
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get all scheduled job names
   */
  getJobNames(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Check if a job is running
   * @param jobName - The name of the job to check
   */
  isJobRunning(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    return job ? job.getStatus() === 'scheduled' : false;
  }

  /**
   * Get the status of all jobs
   */
  getJobsStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.jobs.forEach((job, name) => {
      const jobStatus = job.getStatus();
      status[name] = typeof jobStatus === 'string' ? jobStatus : 'unknown';
    });
    return status;
  }
}

// Create a singleton instance
export const cronService = new CronService();
