import Suggestify from './suggestify';

new Suggestify('#suggestify', {
	engine: 'http://localhost:3001/api/suggestions',
	class: 'suggestify',
	blur: true,
	instant: false,
	icon: true,
	url: '?q=',
});
