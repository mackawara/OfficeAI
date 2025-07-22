export const CONFIG = {
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_HOST_PORT: Number(process.env.REDIS_HOST_PORT) || 6379,
  REDIS_CONNECT_TIMEOUT: Number(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
  IS_LOCAL_ENVIRONMENT: process.env.NODE_ENV !== 'production',
}; 