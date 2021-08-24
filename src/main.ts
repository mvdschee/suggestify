import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: 'https://suggestify-engine.maxvanderschee.nl/api/suggestions',
	class: 'suggestify',
	blur: true,
	instant: false,
	icon: true,
	url: '?q=',
});
