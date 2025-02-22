import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 20) {
        console.log('Redis bağlantısı başarısız, yeniden deneme durduruldu.');
        return false;
      }
      return Math.min(retries * 500, 5000);
    },
  },
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export default redisClient; 