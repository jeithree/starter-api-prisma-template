import {createClient} from 'redis';
import {DEV_MODE, REDIS_PASSWORD, REDIS_URL} from './configs/basic.ts';

const redisClient = createClient({
	url: REDIS_URL,
	password: !DEV_MODE ? REDIS_PASSWORD : undefined,
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('Redis: connecting...'));
redisClient.on('ready', () => console.log('Redis: ready'));

await redisClient.connect();
export default redisClient;
