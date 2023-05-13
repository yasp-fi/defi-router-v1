import RedisClient, { Redis, RedisOptions } from 'ioredis'

const defaultRedisOptions: RedisOptions = {
  commandTimeout: 20_000,
}


export function getRedisClient(
  redisHost: string,
  redisOptions: RedisOptions = defaultRedisOptions
): Redis {
  const client = new RedisClient(redisHost, redisOptions);

  client.on('error', (error) => {
    console.error({ error }, `redis client error: ${error.message}`)
  })

  client.on('close', () => {
    console.info(`redis client closed`)
  })

  return client
}
