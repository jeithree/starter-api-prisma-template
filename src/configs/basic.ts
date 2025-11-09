export const DEV_MODE = process.env.NODE_ENV === 'development';
export const PORT = parseInt(process.env.PORT as string) || 3000;
export const MAX_PAYLOAD_SIZE = process.env.MAX_PAYLOAD_SIZE || '25kb';
export const MAX_IMAGE_UPLOAD_SIZE = '2mb';
export const TIME_ZONE = process.env.TIME_ZONE || 'America/Lima';
export const LOCALE = process.env.LOCALE || 'en-US';

if (DEV_MODE) {
	// to avoid problems with selfsigned certificates during development
	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

if (!process.env.SESSION_SECRET) {
	throw new Error('No SESSION_SECRET env variable set');
}
if (!process.env.SESSION_PREFIX) {
	throw new Error('No SESSION_PREFIX env variable set');
}
if (!process.env.BCRYPT_SALT_ROUNDS) {
	throw new Error('No BCRYPT_SALT_ROUNDS env variable set');
}
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const SESSION_PREFIX = process.env.SESSION_PREFIX;
export const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS);

if (!process.env.REDIS_HOST) {
	throw new Error('No REDIS_HOST env variable set');
}
if (!process.env.REDIS_PORT) {
	throw new Error('No REDIS_PORT env variable set');
}
if (!DEV_MODE && !process.env.REDIS_PASSWORD) {
	throw new Error('No REDIS_PASSWORD env variable set');
}
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

if (!process.env.SITE_NAME) {
	throw new Error('No SITE_NAME env variable set');
}
if (!process.env.SITE_URL) {
	throw new Error('No SITE_URL env variable set');
}
if (!process.env.API_URL) {
	throw new Error('No API_URL env variable set');
}
export const SITE_NAME = process.env.SITE_NAME;
export const SITE_URL = process.env.SITE_URL;
export const API_URL = process.env.API_URL;
export const CORS_ORIGIN_WHITELIST = [SITE_URL];

if (!process.env.ADMIN_USERNAME) {
	throw new Error('No ADMIN_USERNAME env variable set');
}
if (!process.env.ADMIN_EMAIL) {
	throw new Error('No ADMIN_EMAIL env variable set');
}
if (!process.env.ADMIN_PASSWORD) {
	throw new Error('No ADMIN_PASSWORD env variable set');
}
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!process.env.SMTP_HOST) {
	throw new Error('No SMTP_HOST env variable set');
}
if (!process.env.SMTP_USER) {
	throw new Error('No SMTP_USER env variable set');
}
if (!process.env.SMTP_PASS) {
	throw new Error('No SMTP_PASS env variable set');
}
export const SMTP_CONFIG = {
	host: process.env.SMTP_HOST,
	port: 587,
	secure: false, // true for 465, false for other ports
	user: process.env.SMTP_USER,
	pass: process.env.SMTP_PASS,
};

if (!process.env.FB_CLIENT_ID) {
	throw new Error('No FB_APP_ID env variable set');
}
if (!process.env.FB_CLIENT_SECRET) {
	throw new Error('No FB_APP_SECRET env variable set');
}
if (!process.env.FB_CALLBACK_URL) {
	throw new Error('No FB_CALLBACK_URL env variable set');
}
if (!process.env.FB_SCOPE) {
	throw new Error('No FB_SCOPE env variable set');
}
if (!process.env.FB_AUTH_URL) {
	throw new Error('No FB_AUTH_URL env variable set');
}
if (!process.env.FB_TOKEN_API_URL) {
	throw new Error('No FB_TOKEN_API_URL env variable set');
}
if (!process.env.FB_USER_API_URL) {
	throw new Error('No FB_USER_API_URL env variable set');
}
export const FB_CLIENT_ID = process.env.FB_CLIENT_ID;
export const FB_CLIENT_SECRET = process.env.FB_CLIENT_SECRET;
export const FB_CALLBACK_URL = API_URL + process.env.FB_CALLBACK_URL;
export const FB_SCOPE = process.env.FB_SCOPE.split(',');
export const FB_AUTH_URL = process.env.FB_AUTH_URL;
export const FB_TOKEN_API_URL = process.env.FB_TOKEN_API_URL;
export const FB_USER_API_URL = process.env.FB_USER_API_URL;

if (!process.env.GOOGLE_CLIENT_ID) {
	throw new Error('No GOOGLE_CLIENT_ID env variable set');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
	throw new Error('No GOOGLE_CLIENT_SECRET env variable set');
}
if (!process.env.GOOGLE_CALLBACK_URL) {
	throw new Error('No GOOGLE_CALLBACK_URL env variable set');
}
if (!process.env.GOOGLE_SCOPE) {
	throw new Error('No GOOGLE_SCOPE env variable set');
}
if (!process.env.GOOGLE_AUTH_URL) {
	throw new Error('No GOOGLE_AUTH_URL env variable set');
}
if (!process.env.GOOGLE_TOKEN_API_URL) {
	throw new Error('No GOOGLE_TOKEN_API_URL env variable set');
}
if (!process.env.GOOGLE_USER_API_URL) {
	throw new Error('No GOOGLE_USER_API_URL env variable set');
}
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = API_URL + process.env.GOOGLE_CALLBACK_URL;
export const GOOGLE_SCOPE = process.env.GOOGLE_SCOPE.split(',');
export const GOOGLE_AUTH_URL = process.env.GOOGLE_AUTH_URL;
export const GOOGLE_TOKEN_API_URL = process.env.GOOGLE_TOKEN_API_URL;
export const GOOGLE_USER_API_URL = process.env.GOOGLE_USER_API_URL;

export const LOGIN_ATTEMPTS_FOR_10_MINUTES_BLOCK = 4;
export const LOGIN_ATTEMPTS_FOR_24_HOURS_BLOCK = 8;

export const EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS = 24;
export const PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES = 10;

export const NOT_ALLOWED_USERNAMES = [
	// Spanish
	'admin',
	'administrador',
	'superusuario',
	'root',
	'administra',
	'supervisor',
	'gestor',
	'administrativo',
	'administración',
	'sysadmin',
	// English
	'admin',
	'administrator',
	'superuser',
	'root',
	'manage',
	'supervisor',
	'systemadmin',
	'manager',
	'executive',
	'control',
];
