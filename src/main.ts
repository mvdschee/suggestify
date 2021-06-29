import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: '/api/search',
	url: 'https://google.com/search?q=',
});
