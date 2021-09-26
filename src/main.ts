import Suggestify from './suggestify';

const url = 'https://suggestify-engine.maxvanderschee.nl';

const onComplete = async ({ value, success }) => {
	try {
		await fetch(`${url}/api/events`, {
			method: 'POST',
			body: JSON.stringify({
				value,
				success,
			}),
		});

		return true;
	} catch (error) {
		return true;
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
