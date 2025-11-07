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

const getAllSessions = async () => {
	const pattern = 'authsess:*';
	const allSessions = [];

	// Use SCAN to iterate keys (avoids blocking Redis)
	for await (const key of redisClient.scanIterator({MATCH: pattern})) {
		const data = await redisClient.get(key[0]);
		if (!data) continue;
		try {
			const session = JSON.parse(data);
			allSessions.push({key, session});
		} catch {
			continue;
		}
	}

	return allSessions;
};

export const deleteUserSessions = async (userId: string) => {
	const sessions = await getSessionByUserId(userId);
	for (const {key} of sessions) {
		await redisClient.del(key);
	}
};

export const deleteSessionById = async (sessionId: string) => {
	const session = await redisClient.get(`authsess:${sessionId}`);
	if (!session) return;
	await redisClient.del(`authsess:${sessionId}`);
};

export const getSessionsPaginated = async (
	currentSessionId: string,
	pageSize: number,
	skip: number,
	orderBy: any
) => {
	const allSessions = await getAllSessions();

	if (allSessions.length === 0) {
		return {
			sessions: [],
			total: 0,
		};
	}

	allSessions.sort((a, b) => {
		for (const order of orderBy) {
			const field = Object.keys(order)[0];
			const direction = order[field];
			if (a.session[field] < b.session[field])
				return direction === 'asc' ? -1 : 1;
			if (a.session[field] > b.session[field])
				return direction === 'asc' ? 1 : -1;
		}
		return 0;
	});

	// Paginate sessions
	const paginatedSessions = allSessions.slice(skip, skip + pageSize);
	return {
		// scanIterator yields arrays like ['authsess:abc123'], so you need to access key[0].
		sessions: paginatedSessions.map(({key, session}) => ({
            // no need to expose all the session data, just the relevant fields
			id: session.id,
            userId: session.userId,
            role: session.role,
            usernameToDisplay: session.usernameToDisplay,
            email: session.email,
            isLogged: session.isLogged,
			// if current session id found then add isCurrentSession: true
			isCurrentSession: key[0] === `authsess:${currentSessionId}`, // Add [0]
		})),
		total: allSessions.length,
	};
};
