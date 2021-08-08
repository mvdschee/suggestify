import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: 'http://localhost:3001/api/search',
	class: 'suggestify',
	blur: true,
	instant: false,
	icon: true,
	url: 'https://www.google.com/search?q=',
});
