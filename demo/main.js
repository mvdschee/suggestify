import Suggestify from './suggestify.es.js';

const url = 'https://events.suggestify.org';

const onComplete = async ({ value, success }) => {
	const controller = new AbortController();
	const signal = controller.signal;

	try {
		setTimeout(() => {
			controller.abort();
			return true;
		}, 100);

		await fetch(url, {
			method: 'POST',
			signal,
			body: JSON.stringify({
				value,
				success,
				team: 'example',
			}),
		});
	} catch (error) {
		return false;
	}
};

fetch(url, {
	method: 'OPTIONS',
});

new Suggestify('#suggestify', {
	engine: `/api/suggestions`,
	class: 'suggestify',
	blur: true,
	instant: false,
	icon: true,
	url: '?q=',
	onComplete,
});
