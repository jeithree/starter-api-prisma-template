import i18n from 'i18n';
import path from 'node:path';

const __dirname = import.meta.dirname;

i18n.configure({
	locales: ['es', 'en'], // Supported languages
	directory: path.join(__dirname, '../locales'), // Path to translation files
	defaultLocale: 'es', // Default language
	objectNotation: true, // Allows nested keys like "USER.accountBlocked"
	autoReload: true, // Automatically reload files on changes
	syncFiles: true, // Keep missing translations consistent across locales
	queryParameter: 'lang', // Optional: use ?lang=xx to set the locale
});

export default i18n;
