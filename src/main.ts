import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: '/api/search',
	class: 'suggestify',
	url: 'https://google.com/search?q=',
});
