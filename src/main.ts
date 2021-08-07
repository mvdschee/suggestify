import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: '/api/search',
	class: 'suggestify',
	blur: false,
	instant: true,
	icon: true,
	url: 'https://www.google.com/search?q=',
});
