import { config } from './config';

export async function singleSearchHandler(search, words) {
	const results = [];
	const reg = new RegExp(search.replace(/\W+/g, '|'), 'i');

	for (let i = 0; i < words.length; i++) {
		const m = reg.exec(words[i]);

		if (m.index === 0) results.push(words[i].toLowerCase());
		if (results.length === config.ITEM_CAP) break;
	}

	return Promise.resolve(results.sort());
}
