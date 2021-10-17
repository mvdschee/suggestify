const supabaseJs = require('@supabase/supabase-js');
const rateLimit = require('lambda-rate-limiter')({
	interval: 1000 * 60, // Our rate-limit interval, 1 minute
	uniqueTokenPerInterval: 500,
});

const config = {
	RATELIMIT_CAP: 50,
	RATELIMIT_TEXT: 'Too Many Requests',
	INTERNAL_ERROR: 'Woopsie, we will look into it!',
	SUCCESS: 'ok',
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
const secrets = {
	url: process.env.SUPABASE_URL,
	team_id: process.env.SUPABASE_TEAM_ID,
	prefix: process.env.SUPABASE_PREFIX,
	service_key: process.env.SUPABASE_SERVICE_KEY,
};
const supabase = supabaseJs.createClient(secrets.url, secrets.service_key);

/**
 *
 * @param {(req: Request, res: Response) => Promise<Response> }
 * @description Function to handle client callback
 * @returns {Promise<Response>} Response
 */
const handler = async (req, res) => {
	const { headers, body } = req;

	const parsed = JSON.parse(body);

	const value = sanitize(parsed.value);
	const success = sanitize(parsed.success);

	try {
		await rateLimit.check(config.RATELIMIT_CAP, headers['x-real-ip']);
	} catch (e) {
		return res.status(429).send(config.RATELIMIT_TEXT);
	}

	if (value) {
		try {
			if (success === 'MISS' || success === 'HIT') await EventsHandler({ value, success });
			await SuggstionHandler({ value });

			return res.status(200).send(config.SUCCESS);
		} catch (error) {
			console.log(error);
			return res.status(500).send(config.INTERNAL_ERROR);
		}
	}
};

const SuggstionHandler = async ({ value }) => {
	const suggestions = `${secrets.prefix}_suggestions`;
	const dataset = {
		value,
		team_id: secrets.team_id,
	};

	try {
		const { data } = await supabase.from(suggestions).select('*').eq('value', value);

		if (data && data.length) {
			await supabase
				.from(suggestions)
				.update({ hits: data[0].hits + 1 })
				.eq('id', data[0].id);
		} else {
			await supabase.from(suggestions).insert(dataset);
		}
	} catch (error) {
		console.log(error);
	}
};

const EventsHandler = async ({ value, success }) => {
	const events = `${secrets.prefix}_events`;
	const dataset = {
		value,
		success,
		team_id: secrets.team_id,
	};

	try {
		await supabase.from(events).insert(dataset);
	} catch (error) {
		console.log(error);
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
	return input.replace(reg, (match) => config.SANITIZE[match]).trim();
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
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
	);

	return await fn(req, res);
};

export default allowCors(handler);
