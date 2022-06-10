const SuggestifyEngine = require('@suggestify/engine');
const rateLimit = require('lambda-rate-limiter')({
	interval: 1000 * 60, // Our rate-limit interval, 1 minute
	uniqueTokenPerInterval: 500,
});

const _default = require('./data/default.json');
const _sorted = require('./data/sorted.json');
const _recommended = require('./data/recommended.json');
const config = {
	RATELIMIT_CAP: 50,
	RATELIMIT_TEXT: 'Too Many Requests',
	INTERNAL_ERROR: 'Woopsie, we will look into it!',
	ALLOWED_ORIGINS: ['http://localhost:3000', 'https://suggestify.maxvanderschee.nl'],
	SANITIZE: {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'`': '&grave;',
		'/': '&#x2F;',
	},
};

const suggestifyEngine = new SuggestifyEngine({
	defaultItems: _default,
	sortedItems: _sorted,
	options: {
		MIN_DISTANCE: 4,
		ITEM_CAP: 8,
	},
});

/**
 *
 * @param {(req: Request, res: Response) => Promise<Response> }
 * @description Function to handle client call to suggestion engine
 * @returns {Promise<Response>} Response
 */
const handler = async (req, res) => {
	const { headers, query } = req;

	try {
		await rateLimit.check(config.RATELIMIT_CAP, headers['x-real-ip']);
	} catch (e) {
		return res.status(429).send(config.RATELIMIT_TEXT);
	}

	const userInput = query.q ? sanitize(query.q) : null;

	if (!userInput) return res.status(200).json({ type: 'suggestions', items: _recommended, time: '0ms' });
	else
		try {
			let start = process.hrtime();
			const sortedItems = await suggestifyEngine.getResults(userInput);
			let stop = process.hrtime(start);

			return res.status(200).json({
				type: sortedItems.length ? 'results' : 'empty',
				items: sortedItems,
				time: `${(stop[0] * 1e3 + stop[1] / 1e6).toFixed(2)}ms`,
			});
		} catch (error) {
			console.log(error);
			return res.status(500).send(config.INTERNAL_ERROR);
		}
};

/**
 *
 * @param {string} text
 * @description methode to sanitize text against common scripting tags
 * @returns {string} santized lowercase text
 */
const sanitize = (input) => {
	const reg = /[&<>"'/`]/gi;
	return input
		.replace(reg, (match) => config.SANITIZE[match])
		.trim()
		.toLowerCase();
};

/**
 *
 * @param {(req: Request, res: Response) => Promise<Response> } fn
 * @description Wrapper methode to handle CORS settings
 * @returns {(req: Request, res: Response) => Promise<Response>} methode wrapped with CORS headers
 */
const allowCors = (fn) => async (req, res) => {
	const origin = req.headers.origin;

	if (config.ALLOWED_ORIGINS.indexOf(origin) > -1) res.setHeader('Access-Control-Allow-Origin', origin);
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Methods', 'GET');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
	);

	return await fn(req, res);
};

export default allowCors(handler);
