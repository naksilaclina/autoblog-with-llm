import Queue from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const createQueue = (name: string) => {
  return new Queue(name, {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    prefix: process.env.QUEUE_PREFIX,
  });
};

export const contentPublishQueue = createQueue('content-publish');
export const analyticsQueue = createQueue('analytics-collect'); 