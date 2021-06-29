import Search from '../dist/suggestify.es';

const search = new Search('#suggestify', {
	engine: '/api/search',
	url: 'https://google.com/search?q=',
});
