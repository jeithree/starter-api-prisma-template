import helmet from 'helmet';

export const startHelmet = () => {
	return helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				connectSrc: ["'self'"],
				scriptSrc: ["'self'"],
			},
		},
	});
};
