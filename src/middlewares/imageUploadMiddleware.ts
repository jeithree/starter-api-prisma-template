import path from 'node:path';
import multer from 'multer';
import {ValidationError} from '../lib/domainError.ts';
const __dirname = import.meta.dirname;
import {translate} from '../helpers/helper.ts';

const upload = multer({
	storage: multer.diskStorage({
		destination: (_req, _file, cb) => {
			cb(null, path.join(__dirname, '../../public/uploads/avatars'));
		},
		filename: (req, file, cb) => {
			const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
			const fileName = `${uniqueSuffix}-${file.originalname
				.toLocaleLowerCase()
				.replace(/\s+/g, '-')}`;
			req.body.avatar = fileName;
			cb(null, fileName);
		},
	}),
	limits: {fileSize: 2 * 1024 * 1024}, // 2MB
	fileFilter: (_req, file, cb) => {
		const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new ValidationError({
					errorCode: 'INVALID_FILE_TYPE',
					message: translate('validation.INVALID_FILE_TYPE'),
				})
			);
		}
	},
});

export default upload;
