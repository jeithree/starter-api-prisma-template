import type {Options as PQueueOptions} from 'p-queue';
import PQueue from 'p-queue';
import {NotFoundError} from './domainError.ts';

class QueueManager {
	static #queues: Map<string, PQueue> = new Map();

	/**
	 * Creates a new named queue with specified options
	 * @param name - The name of the queue
	 * @param options - The options for the queue
	 * @returns The queue instance
	 */
	static createQueue(
		name: string,
		options: PQueueOptions<any, any> = {concurrency: 1, autoStart: true}
	) {
		const queue = new PQueue(options);
		this.#queues.set(name, queue);
		return queue;
	}

	/**
	 * Retrieves a named queue if it exists, otherwise throws an error
	 * @param name - The name of the queue
	 * @returns The queue instance
	 */
	static getQueue(name: string) {
        const queue = this.#queues.get(name);
		if (!queue) {
			throw new NotFoundError({
				messageKey: 'internal.queue.errors.QUEUE_NOT_FOUND',
				replacements: {name},
			});
		}
		return queue;
	}

	/**
	 * Adds a task to a specific named queue, if the queue doesn't exist, it throws an error
	 * @param name - The name of the queue
	 * @param fn - The function to add to the queue
	 * @returns The result of the added task
	 */
	static async addToQueue<T>(name: string, fn: () => Promise<T>) {
		const queue = this.getQueue(name);
		return queue.add(fn);
	}

	/**
	 * Pauses a specific queue, if the queue doesn't exist, it throws an error
	 * @param name - The name of the queue
	 * @returns void
	 */
	static pauseQueue(name: string) {
		const queue = this.getQueue(name);
		queue.pause();
	}

	/**
	 * Resumes a specific queue, if the queue doesn't exist, it throws an error
	 * @param name - The name of the queue
	 * @returns void
	 */
	static resumeQueue(name: string) {
		const queue = this.getQueue(name);
		return queue.start();
	}

	/**
	 * Clears all pending tasks from a queue, if the queue doesn't exist, it throws an error
	 * @param name - The name of the queue
	 * @returns void
	 */
	static clearQueue(name: string) {
		const queue = this.getQueue(name);
		queue.clear();
	}

	/**
	 * Get information about a queue's status, if the queue doesn't exist, it throws an error
	 * @param name - The name of the queue
	 * @returns An object containing the queue's size, pending tasks, and paused status
	 */
	static getQueueStatus(name: string) {
		const queue = this.getQueue(name);

		return {
			size: queue.size,
			pending: queue.pending,
			isPaused: queue.isPaused,
		};
	}
}

export default QueueManager;
