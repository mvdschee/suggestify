import { nanoid } from 'nanoid';

interface Options {
	url?: string;
	engine?: string;
}

interface Cache {
	[key: string]: Object;
}

class Search {
	private root: Element | null;
	private engine: string;
	private url: string;
	private input?: Element | null;
	private result?: Element | null;
	private cache: Cache = {};
	private timeout = 400;

	constructor(selector: string | Element, options: Options) {
		this.root = typeof selector === 'string' ? document.querySelector(selector) : selector;
		this.url = options.url || '/search?q=';
		this.engine = options.engine || '/api/search';
		this.input = this.root?.querySelector('input');
		this.result = this.root?.querySelector('ul');

		this.initialize();
	}

	initialize(): void {
		// set icon
		const i = document.createElement('i');
		i.classList.add('suggestify-icon');
		this.root?.insertBefore(i, this.root?.childNodes[0]);

		console.log(this.url);

		if (this.input && this.result) {
			this.input.setAttribute('role', 'combobox');
			this.input.setAttribute('autocomplete', 'off');
			this.input.setAttribute('autocapitalize', 'off');
			this.input.setAttribute('autocorrect', 'off');
			this.input.setAttribute('spellcheck', 'false');
			this.input.setAttribute('aria-autocomplete', 'list');
			this.input.setAttribute('aria-haspopup', 'listbox');
			this.input.setAttribute('aria-expanded', 'false');

			this.result.setAttribute('role', 'listbox');
			if (!this.result.id) this.result.id = `suggestify-result-${nanoid(5)}`;

			this.input.setAttribute('aria-owns', this.result.id);
			this.input.addEventListener('input', this.searchHandler, { passive: true });
		}
	}

	searchHandler = (e: any): void => {
		const text = e.target.value;

		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.request(sanitize(text)).then((response) => {
				console.log(response);
			});
			// update timeout time too
		}, 400);
	};

	request = (search: string | null): Promise<any> => {
		const cacheKey = JSON.stringify(search);
		if (this.cache[cacheKey]) return Promise.resolve(this.cache[cacheKey]);

		const options = {
			method: 'POST',
			body: JSON.stringify({
				search,
			}),
		};

		const result = fetch(this.engine, options).then((response) => response.json());
		this.cache[cacheKey] = result;

		return result;
	};
}

function sanitize(string: string) {
	const map: any = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'`': '&grave;',
		'/': '&#x2F;',
	};
	const reg = /[&<>"'/`]/gi;
	return string.replace(reg, (match) => map[match]);
}

export default Search;
