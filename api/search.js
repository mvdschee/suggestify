const LS = require('./levenshtein');
const rateLimit = require('lambda-rate-limiter')({
	interval: 1000 * 60, // Our rate-limit interval, 1 minute
	uniqueTokenPerInterval: 500,
});

const FRUITS = ['Apple', 'Banana', 'Blueberry', 'Cherries'];
const MIN_DISTANCE = 3;

module.exports = async (req, res) => {
	const { body, headers } = req;

	const search = sanitize(body.search) || null;

	try {
		await rateLimit.check(50, headers['x-real-ip']);
	} catch (error) {
		res.status(429).send('Too Many Requests');
	}

	if (!search) res.status(404).send('No search');

	try {
		const result = await searchHandler(search);
		res.status(200).json(result);
	} catch (error) {
		res.status(500).send('Internal server Error');
	}
};

function searchHandler(event) {
	const searchText = event.toLowerCase();

	const filteredFruits = FRUITS.filter((fruit) => {
		const distance = LS.levenshtein(fruit.toLowerCase(), searchText);
		return distance <= MIN_DISTANCE;
	});

	return filteredFruits;
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
