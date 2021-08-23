import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: 'https://suggestify-engine.maxvanderschee.nl/api/suggestions',
	class: 'suggestify',
	blur: false,
	instant: true,
	icon: true,
	url: '?q=',
});
