import https from 'https';
import fs from 'fs';
import path from 'node:path';
import app from './app.ts';

// Config
import {DEV_MODE} from './configs/basic.ts';

// Initializations
const __dirname = import.meta.dirname;

if (DEV_MODE) {
	// This is just to use https for development
	const options = {
		key: fs.readFileSync(path.join(__dirname, './certificates/key.pem')),
		cert: fs.readFileSync(path.join(__dirname, './certificates/cert.pem')),
	};

	https.createServer(options, app).listen(app.get('port'), () => {
		console.log(`HTTPS API server on https://localhost:${app.get('port')}`);
	});
} else {
	app.listen(app.get('port'), () => {
		console.log(`API server on http://localhost:${app.get('port')}`);
	});
}

process.stdout.write('\x1b]0;Starter API Server\x07');

const gracefulShutdown = async () => {
	try {
		// things that need to be done before shutting down
		process.exit(0);
	} catch (error) {
		console.error('Error during shutdown:', error);
		process.exit(1);
	}
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
