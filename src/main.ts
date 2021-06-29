import '../lib/style.scss';
import Suggestify from '../lib/suggestify';

new Suggestify('#suggestify', {
	engine: '/api/search',
	url: 'https://google.com/search?q=',
});
