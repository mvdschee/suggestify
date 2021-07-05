const { levenshtein } = require('./utils');
const { config } = require('./config');

export async function singleSearchHandler(search, words) {
	const list = {
		match: [],
		alt: [],
	};
	let results = [];

	const wordsMatch = (item) => {
		const reg = new RegExp(search.replace(/\W+/g, '|'), 'i');
		const m = reg.exec(item);

		if (m.index === 0) {
			list['match'].push(item);
		}
		return;
	};

	const AltMatch = (item) => {
		const distance = levenshtein(item.toLowerCase(), searchText);
		if (distance <= config.MIN_DISTANCE) {
			list['alt'].push(item);
		}
		return;
	};

	for (let i = 0; i < words.length; i++) {
		wordsMatch(words[i]);
		AltMatch(words[i]);
	}

	results = new Set([...sortMatches.sort(), ...list['alt'].sort()]);

	return Promise.resolve([...results].slice(0, config.ITEM_CAP));
}
