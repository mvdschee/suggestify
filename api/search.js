const mock = require('./mock.json');
const rateLimit = require('lambda-rate-limiter')({
	interval: 1000 * 60, // Our rate-limit interval, 1 minute
	uniqueTokenPerInterval: 500,
});

const suggestion = ['Web Developer', 'Graphic Designer', 'Professor', 'Social Worker'];
const MIN_DISTANCE = 3;

module.exports = async (req, res) => {
	const { headers } = req;
	const body = JSON.parse(req.body);
	const search = body.search ? sanitize(body.search.trim()) : 'empty';

	try {
		await rateLimit.check(50, headers['x-real-ip']);
	} catch (error) {
		res.status(429).send('Too Many Requests');
	}

	if (search === 'empty') res.status(200).json(suggestion);
	else
		try {
			const result = searchHandler(search);
			res.status(200).json(result);
		} catch (error) {
			res.status(500).send('Internal server Error');
		}
};

function searchHandler(event) {
	const searchText = event.toLowerCase();

	const filteredResults = mock.jobs.filter((job) => {
		const distance = levenshtein(job.toLowerCase(), searchText);
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

// https://github.com/gustf/js-levenshtein
function levenshtein(a, b) {
	if (a === b) {
		return 0;
	}

	if (a.length > b.length) {
		const tmp = a;
		a = b;
		b = tmp;
	}

	let la = a.length;
	let lb = b.length;

	while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
		la--;
		lb--;
	}

	let offset = 0;

	while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
		offset++;
	}

	la -= offset;
	lb -= offset;

	if (la === 0 || lb < 3) {
		return lb;
	}

	const x = 0;
	let y;
	let d0;
	let d1;
	let d2;
	let d3;
	let dd;
	let dy;
	let ay;
	let bx0;
	let bx1;
	let bx2;
	let bx3;

	const vector = [];

	for (y = 0; y < la; y++) {
		vector.push(y + 1);
		vector.push(a.charCodeAt(offset + y));
	}

	const len = vector.length - 1;

	for (let x = 0; x < lb - 3; ) {
		bx0 = b.charCodeAt(offset + (d0 = x));
		bx1 = b.charCodeAt(offset + (d1 = x + 1));
		bx2 = b.charCodeAt(offset + (d2 = x + 2));
		bx3 = b.charCodeAt(offset + (d3 = x + 3));
		dd = x += 4;
		for (y = 0; y < len; y += 2) {
			dy = vector[y];
			ay = vector[y + 1];
			d0 = _min(dy, d0, d1, bx0, ay);
			d1 = _min(d0, d1, d2, bx1, ay);
			d2 = _min(d1, d2, d3, bx2, ay);
			dd = _min(d2, d3, dd, bx3, ay);
			vector[y] = dd;
			d3 = d2;
			d2 = d1;
			d1 = d0;
			d0 = dy;
		}
	}

	for (let x = 0; x < lb; ) {
		bx0 = b.charCodeAt(offset + (d0 = x));
		dd = ++x;
		for (y = 0; y < len; y += 2) {
			dy = vector[y];
			vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
			d0 = dy;
		}
	}

	return dd;
}

function _min(d0, d1, d2, bx, ay) {
	return d0 < d1 || d2 < d1 ? (d0 > d2 ? d2 + 1 : d0 + 1) : bx === ay ? d1 : d1 + 1;
}
