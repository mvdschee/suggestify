import './style.scss';
import Search from './search';

new Search('#suggestify', {
	engine: '/api/search',
	url: 'https://google.com/search?q=',
});
