import 'express-session';
import type {SessionDto} from './session.ts';

declare module 'express-session' {
	interface SessionData extends SessionDto {}
}
