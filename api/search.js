const mock = require('./mock.json');
const A = require('./algorithms');
const rateLimit = require('lambda-rate-limiter')({
	interval: 1000 * 60, // Our rate-limit interval, 1 minute
	uniqueTokenPerInterval: 500,
});

const suggestion = [
	'Wallaby, tammar',
	'Gerenuk',
	'Oryx, fringe-eared',
	'Fat-tailed dunnart',
	'Red-shouldered glossy starling',
	'Southern boubou',
	'Wild turkey',
	'Mourning collared dove',
	'Snake, eastern indigo',
	'Blue catfish',
	'Greater roadrunner',
	'Orca',
];
const MIN_DISTANCE = 3;

module.exports = async (req, res) => {
	const { headers } = req;
	const body = JSON.parse(req.body);
	const search = body.search ? sanitize(body.search.trim()) : null;

	try {
		await rateLimit.check(50, headers['x-real-ip']);
	} catch (error) {
		res.status(429).send('Too Many Requests');
	}

	if (!search) res.status(200).json({ type: 'suggestions', items: suggestion });
	else
		try {
			const result = searchHandler(search);
			res.status(200).json({ type: 'results', items: result });
		} catch (error) {
			res.status(500).send('Internal server Error');
		}
};

function searchHandler(event) {
	const searchText = event.toLowerCase();

	const filteredResults = mock.test.filter((job) => {
		const distance = A.levenshtein(job.toLowerCase(), searchText);
		return distance <= MIN_DISTANCE;
	});

	return filteredResults;
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
