import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: 'http://localhost:3000/api/suggestions',
	class: 'suggestify',
	blur: true,
	instant: false,
	icon: true,
	url: '?q=',
});
