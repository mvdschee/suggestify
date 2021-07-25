import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: '/api/search',
	class: 'suggestify',
	blur: true,
	instant: false,
	url: 'https://www.google.com/search?q=',
});
