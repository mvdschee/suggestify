import Suggestify from './suggestify.esm.js';

const url = 'https://suggestify-engine.maxvanderschee.nl';

const onComplete = async ({ value, success }) => {
	const controller = new AbortController();
	const signal = controller.signal;

	try {
		setTimeout(() => {
			controller.abort();
			return true;
		}, 100);

		await fetch(`${url}/api/events`, {
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
	engine: `${url}/api/suggestions`,
	class: 'suggestify',
	blur: true,
	instant: false,
	icon: true,
	url: '?q=',
	onComplete,
});
