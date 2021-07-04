const mock = require('./mock.json');
const words = require('./index.json');
const rateLimit = require('lambda-rate-limiter')({
	interval: 1000 * 60, // Our rate-limit interval, 1 minute
	uniqueTokenPerInterval: 500,
});
const MIN_DISTANCE = 3;

module.exports = async (req, res) => {
	const { headers, body } = req;
	const bodyObj = JSON.parse(body);
	const search = bodyObj.search ? sanitize(bodyObj.search.trim()) : null;

	try {
		await rateLimit.check(50, headers['x-real-ip']);
	} catch (error) {
		return res.status(429).send('Too Many Requests');
	}

	if (!search) return res.status(200).json({ type: 'suggestions', items: mock.suggestion });
	else
		try {
			console.time('searchHandler');
			const result = await searchHandler(search);
			console.timeEnd('searchHandler');
			return res.status(200).json({ type: 'results', items: result });
		} catch (error) {
			return res.status(500).send('Internal server Error');
		}
	// return;
};

// total results is 8
// 0: first character of word match
// 1: any character of word match
// 2: first character of any word
// 3: any character of any word
// 4: possible alternatives

async function searchHandler(search) {
	const searchText = search.toLowerCase();
	const cap = 8;
	const list = {
		match: [],
		alt: [],
	};
	let results = [];
	let matchCount = 0;
	let altCount = 0;

	const wordsMatch = (item) => {
		const reg = new RegExp(searchText.replace(/\W+/g, '|'), 'ig');

		if (reg.test(item)) {
			matchCount++;
			list['match'].push(item);
		}
	};

	const AltMatch = (item) => {
		const distance = levenshtein(item.toLowerCase(), searchText);
		if (distance <= MIN_DISTANCE) {
			altCount++;
			list['alt'].push(item);
		}
	};

	for (let i = 0; i < words.length; i++) {
		const item = words[i];

		wordsMatch(item);
		if (altCount !== cap) AltMatch(item);
	}

	const sortMatches = sortResults(list['match'], searchText);

	results = new Set([...sortMatches, ...list['alt'].sort()]);

	return Promise.resolve([...results].slice(0, 8));
}

function sortResults(list, searchText) {
	const results = [];
	const full = new RegExp(searchText, 'i');
	const par = new RegExp(`${searchText.replace(/\W+/g, '|')}`, 'i');
	const unsortedlist = {};

	const unfilterd = list
		.sort()
		.filter((item) => {
			// full match on first word
			const m = full.exec(item);
			if (m && m.index === 0) {
				results.push(item);
				return false;
			} else return true;
		})
		.filter((item) => {
			// full match on any word
			if (full.test(item)) {
				results.push(item);
				return false;
			} else return true;
		})
		.filter((item) => {
			const m = par.exec(item);
			if (m) {
				unsortedlist[item] = m.index;
				return false;
			} else return true;
		});

	const sortedList = Object.keys(unsortedlist).sort((a, b) => {
		return unsortedlist[a] - unsortedlist[b];
	});

	return [...results, ...sortedList, ...unfilterd];
}

const sanitize = (string) => {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'`': '&grave;',
		'/': '&#x2F;',
	};
	const reg = /[&<>"'/`]/gi;
	return string.replace(reg, (match) => map[match]);
};

// https://www.30secondsofcode.org/js/s/levenshtein-distance
const levenshtein = (s, t) => {
	if (!s.length) return t.length;
	if (!t.length) return s.length;
	const arr = [];
	for (let i = 0; i <= t.length; i++) {
		arr[i] = [i];
		for (let j = 1; j <= s.length; j++) {
			arr[i][j] =
				i === 0
					? j
					: Math.min(
							arr[i - 1][j] + 1,
							arr[i][j - 1] + 1,
							arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
					  );
		}
	}
	return arr[t.length][s.length];
};
