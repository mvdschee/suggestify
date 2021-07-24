import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: '/api/search',
	class: 'suggestify',
	blur: false,
	url: 'https://www.google.com/search?q=',
});
