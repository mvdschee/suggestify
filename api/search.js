const mock = require('./mock.json');
const words = require('./index.json');
const { multiSearchHandler } = require('./core/multi');
const { singleSearchHandler } = require('./core/single');
const rateLimit = require('lambda-rate-limiter')({
	interval: 1000 * 60, // Our rate-limit interval, 1 minute
	uniqueTokenPerInterval: 500,
});

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
			const result = await searchHandler(search.toLowerCase());
			console.timeEnd('searchHandler');
			return res.status(200).json({ type: 'results', items: result });
		} catch (error) {
			return res.status(500).send('Woopsie, we will look into it!');
		}
};

const searchHandler = (search) => {
	if (search.lenght >= 3) return singleSearchHandler(search, words);
	else return multiSearchHandler(search, words);
};

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
