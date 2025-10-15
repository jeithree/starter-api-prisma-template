import nodemailer from 'nodemailer';
import {SITE_NAME, SMTP_CONFIG, DEV_MODE} from '../configs/basic.ts';

/**
 * Mail Manager
 */
class MailManager {
	static #createEmailTransporter() {
		return nodemailer.createTransport({
			host: SMTP_CONFIG.host,
			port: SMTP_CONFIG.port,
			secure: SMTP_CONFIG.secure,
			requireTLS: true,
			// service: SMTP_CONFIG.service,
			auth: {
				user: SMTP_CONFIG.user,
				pass: SMTP_CONFIG.pass,
			},
			tls: {
				rejectUnauthorized: !DEV_MODE,
				minVersion: 'TLSv1.2',
			},
		});
	}

	/**
	 * Send Email
	 */
	static async send({
		from = `"${SITE_NAME}" <${SMTP_CONFIG.user}>`,
		to,
		subject,
		html,
	}: {
		from?: string;
		to: string;
		subject: string;
		html: string;
	}) {
		const transporter = this.#createEmailTransporter();
		const result = await transporter.sendMail({
			from: from,
			to: to,
			subject: subject,
			html: html,
		});

		return result;
	}
}

export default MailManager;
