import redisClient from '../redisClient.ts';

const getSessionByUserId = async (userId: string) => {
	const pattern = 'authsess:*';
	const foundSessions = [];

	// Use SCAN to iterate keys (avoids blocking Redis)
	for await (const key of redisClient.scanIterator({MATCH: pattern})) {
		const data = await redisClient.get(key[0]);
		if (!data) continue;

		try {
			const session = JSON.parse(data);
			if (session.userId === userId) {
				foundSessions.push({key, session});
			}
		} catch {
			continue;
		}
	}

	return foundSessions;
};

export const deleteUserSessions = async (userId: string) => {
	const sessions = await getSessionByUserId(userId);
	for (const {key} of sessions) {
		await redisClient.del(key);
	}
};
