import i18n from '../configs/i18n.ts';

export const translate = (
	key: string,
	replacements: Record<string, string> = {}
) => {
	return i18n.__(key, replacements);
};

export const removeUrlPrefix = (url: string) => {
	const urlWithoutPrefix = url.replace(/^(http(s)?:\/\/)?/, '');
	const urlWithoutSlashes = urlWithoutPrefix.replace(/\/+$/, ''); // to remove any / at the end of the url
	return urlWithoutSlashes;
};

export const capitalizeFirstLetter = (word: string) => {
	return word.charAt(0).toUpperCase() + word.slice(1);
};

export const splitAndGetFirstWord = (sentence: string) => {
	const words = sentence.split(' ');
	return words[0];
};

export const capitalizeEachWord = (sentence: string) => {
	// Filter out empty strings and trim each word
	const words = sentence
		.trim()
		.split(' ')
		.filter((word) => word.length > 0);

	for (let i = 0; i < words.length; i++) {
		words[i] = words[i][0].toUpperCase() + words[i].slice(1);
	}

	return words.join(' ');
};

export const numberWithCommas = (number: number) => {
	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
};

export const numberWithDots = (number: number) => {
	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, '.');
};

export const waitForTimeout = (timeToAwait: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, timeToAwait);
	});
};

// for memory testing purposes
export const showMemoryUsage = () => {
	const memoryData = process.memoryUsage();

	const memoryUsage = {
		rss: `${formatMemoryUsage(
			memoryData.rss
		)} -> Resident Set Size - total memory allocated for the process execution`,
		heapTotal: `${formatMemoryUsage(
			memoryData.heapTotal
		)} -> total size of the allocated heap`,
		heapUsed: `${formatMemoryUsage(
			memoryData.heapUsed
		)} -> actual memory used during the execution`,
		external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
	};

	console.log(memoryUsage);
};

const formatMemoryUsage = (data: number) => {
	return `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
};
