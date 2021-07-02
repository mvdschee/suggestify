const mock = require('./mock.json');
const algorithms = require('./algorithms');
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

// total results is 10
// 0: first word match
// 1: any-other word match
// 2: possible alternatives

async function searchHandler(search) {
	const searchText = search.toLowerCase();
	const cap = 8;
	const list = {
		0: [],
		1: [],
		2: [],
	};
	let match = 0;

	let results = [];

	const wordsMatch = (item) => {
		const words = item.split(' ');
		const reg = new RegExp(searchText, 'i');

		for (let i = 0; i < words.length; i++) {
			if (reg.test(words[i])) {
				match++;
				if (i === 0) {
					list[0].push(item);
				} else {
					list[1].push(item);
				}
			}
		}
	};

	const AltMatch = (item) => {
		const distance = algorithms.levenshtein(item.toLowerCase(), searchText);
		if (distance <= MIN_DISTANCE) {
			match++;
			list[2].push(item);
		}
	};

	for (let i = 0; i < mock.test.length; i++) {
		const item = mock.test[i];

		wordsMatch(item);

		AltMatch(item);

		if (match === cap) break;
	}

	// results = [...list[0], ...list[1], ...list[2]];

	results = new Set([...list[0], ...list[1], ...list[2]]);

	console.log(list[0], list[1], list[2]);

	return Promise.resolve(results);
}

function sanitize(string) {
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
}
