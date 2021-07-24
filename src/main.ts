import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: '/api/search',
	class: 'suggestify',
	dev: true,
	url: 'https://www.google.com/search?q=',
});
