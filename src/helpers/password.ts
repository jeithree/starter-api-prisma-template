import bcrypt from 'bcrypt';
import {BCRYPT_SALT_ROUNDS} from '../configs/basic.ts';

/**
 * Hashes a plain text password using bcrypt.
 */
export const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

/**
 * Compares a plain text password with a hashed password to check if they match.
 */
export const isPasswordValid = async (
	password: string,
	hashedPassword: string
) => {
	return await bcrypt.compare(password, hashedPassword);
};
