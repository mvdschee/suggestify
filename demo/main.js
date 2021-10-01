import Suggestify from './suggestify.es.js';

const url = 'https://suggestify-engine.maxvanderschee.nl/api';

const onComplete = async ({ value, success }) => {
	const controller = new AbortController();
	const signal = controller.signal;

	try {
		setTimeout(() => {
			controller.abort();
			return true;
		}, 100);

		await fetch(`${url}/events`, {
			method: 'POST',
			signal,
			body: JSON.stringify({
				value,
				success,
			}),
		});
	} catch (error) {
		return false;
	}
};

new Suggestify('#suggestify', {
	engine: `${url}/suggestions`,
	class: 'suggestify',
	blur: true,
	instant: false,
	icon: true,
	url: '?q=',
	onComplete,
});
