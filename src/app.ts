import express from 'express';
import cookieParser from 'cookie-parser';
import {init} from './init.ts';

// Config
import {PORT, MAX_PAYLOAD_SIZE, SESSION_SECRET} from './configs/basic.ts';

// Middlewares
import * as helmetMiddleware from './middlewares/helmetMiddleware.ts';
import * as corsMiddleware from './middlewares/corsMiddleware.ts';
import * as sessionMiddleware from './middlewares/sessionMiddleware.ts';
import {errorHandler} from './middlewares/errorHandlerMidleware.ts';
import * as rateLimitMiddleware from './middlewares/rateLimitMiddleware.ts';

// Routes
import {v1routeDefinitions} from './routes/index.ts';

// Initializations
const app = express();
const helmet = helmetMiddleware.startHelmet();
const cors = corsMiddleware.startCors();
const session = sessionMiddleware.createSession();
const sessionTouch = sessionMiddleware.createSessionTouchMiddleware();

await init();

// Settings
app.set('trust proxy', 1);
app.set('port', PORT);

// Middlewares Initializations
app.use(helmet);
app.use(cors);
app.use(express.urlencoded({extended: false, limit: MAX_PAYLOAD_SIZE}));
app.use(express.json({limit: MAX_PAYLOAD_SIZE}));
app.use(cookieParser(SESSION_SECRET));
app.use(session);
app.use(sessionTouch);
app.use(rateLimitMiddleware.generalLimiter);

// Routes middlewares
for (const {prefix, router} of v1routeDefinitions) {
	app.use(prefix, router);
}
app.use(errorHandler);

export default app;
