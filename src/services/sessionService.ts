import redisClient from '../redisClient.ts';
import {SESSION_PREFIX} from '../configs/basic.ts';

const getSessionByUserId = async (userId: string) => {
	const pattern = `${SESSION_PREFIX}*`;
	const foundSessions: {key: string; session: any}[] = [];

	// Use SCAN to iterate keys (avoids blocking Redis)
	for await (const chunk of redisClient.scanIterator({
		MATCH: pattern,
		COUNT: 200,
	})) {
		const keys = Array.isArray(chunk) ? (chunk as string[]) : [chunk as string];

		for (const key of keys) {
			const data = await redisClient.get(key);
			if (!data) continue;

			try {
				const session = JSON.parse(data);
				if (session.userId === userId) {
					foundSessions.push({key, session});
				}
			} catch {}
		}
	}

	return foundSessions;
};

const getAllSessions = async () => {
	const pattern = `${SESSION_PREFIX}*`;
	const allSessions: {key: string; session: any}[] = [];

	for await (const chunk of redisClient.scanIterator({
		MATCH: pattern,
		COUNT: 500,
	})) {
		const keys = Array.isArray(chunk) ? (chunk as string[]) : [chunk as string];

		for (const key of keys) {
			const data = await redisClient.get(key);
			if (!data) continue;

			try {
				const session = JSON.parse(data);
				allSessions.push({key, session});
			} catch {}
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
	const session = await redisClient.get(`${SESSION_PREFIX}${sessionId}`);
	if (!session) return;
	await redisClient.del(`${SESSION_PREFIX}${sessionId}`);
};

export const getSessionsPaginated = async (
	currentSessionId: string,
	pageSize: number,
	skip: number,
	orderBy: Record<string, 'asc' | 'desc'>,
	filters?: {
		search?: string;
		role?: 'USER' | 'ADMIN' | 'MANAGER';
	}
) => {
	let allSessions = await getAllSessions();
	console.log('All Sessions:', allSessions);

	if (allSessions.length === 0) {
		return {
			sessions: [],
			total: 0,
		};
	}

	// Apply filters
	if (filters?.search) {
		const searchLower = filters.search.toLowerCase();
		allSessions = allSessions.filter(
			({session}) =>
				session.usernameToDisplay?.toLowerCase().includes(searchLower) ||
				session.email?.toLowerCase().includes(searchLower)
		);
	}

	if (filters?.role) {
		allSessions = allSessions.filter(
			({session}) => session.role === filters.role
		);
	}

	// Sort sessions by the requested field (defaults to createdAt)
	const field = Object.keys(orderBy ?? {})[0] ?? 'createdAt';
	const direction = (orderBy?.[field] ?? 'desc') as 'asc' | 'desc';

	allSessions.sort((a, b) => {
		// Support createdAt or fallback to lastTouched; generic fallback for other fields
		const av =
			field === 'createdAt'
				? new Date(a.session.createdAt ?? a.session.lastTouched ?? 0).getTime()
				: (a.session as any)[field];
		const bv =
			field === 'createdAt'
				? new Date(b.session.createdAt ?? b.session.lastTouched ?? 0).getTime()
				: (b.session as any)[field];

		if (av < bv) return direction === 'asc' ? -1 : 1;
		if (av > bv) return direction === 'asc' ? 1 : -1;
		return 0;
	});

	// Get total after filtering but before pagination
	const totalFiltered = allSessions.length;

	// Paginate sessions
	const paginatedSessions = allSessions.slice(skip, skip + pageSize);
	return {
		sessions: paginatedSessions.map(({key, session}) => ({
			// no need to expose all the session data, just the relevant fields
			id: key.replace(SESSION_PREFIX, ''),
			userId: session.userId,
			role: session.role,
			usernameToDisplay: session.usernameToDisplay,
			email: session.email,
			timezone: session.timezone,
			locale: session.locale,
			isLogged: session.isLogged,
			createdAt: session.createdAt,
			// if current session id found then add isCurrentSession: true
			isCurrentSession: key === `${SESSION_PREFIX}${currentSessionId}`,
		})),
		total: totalFiltered,
	};
};
