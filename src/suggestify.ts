import './style.scss';
import { nanoid } from 'nanoid';

export interface Options {
	url?: string;
	engine?: string;
	translations?: Translations;
}

export interface Translations {
	suggestions: string;
	linkLabel: string;
	results: string;
}

export interface Cache {
	[key: string]: any;
}

export interface Result {
	type: 'results' | 'suggestions';
	items: string[];
}

class Suggestify {
	private root: Element | null;
	private engine: string;
	private url: string;
	private input?: Element | null;
	private list?: Element | null;
	private translations: Translations | null;
	private cache: Cache = {};
	private timeout = 200;

	constructor(selector: string | Element, options: Options) {
		this.root = typeof selector === 'string' ? document.querySelector(selector) : selector;
		this.url = options.url || '?q=';
		this.translations = options.translations || null;
		this.engine = options.engine || '/api/search';
		this.input = this.root?.querySelector('input');
		this.list = this.root?.querySelector('ul');

		this.initialize();
	}

	initialize(): void {
		const i = document.createElement('i');
		i.setAttribute('role', 'presentation');
		i.setAttribute('focusable', 'false');
		i.setAttribute('aria-hidden', 'true');
		this.root?.insertBefore(i, this.root?.childNodes[0]);

		if (this.input && this.list) {
			this.input.setAttribute('role', 'combobox');
			this.input.setAttribute('autocomplete', 'off');
			this.input.setAttribute('autocapitalize', 'off');
			this.input.setAttribute('autocorrect', 'off');
			this.input.setAttribute('spellcheck', 'false');
			this.input.setAttribute('aria-autocomplete', 'list');
			this.input.setAttribute('aria-haspopup', 'listbox');
			this.input.setAttribute('aria-expanded', 'false');

			this.list.setAttribute('role', 'listbox');
			if (!this.list.id) this.list.id = `suggestify-result-${nanoid(5)}`;

			this.input.setAttribute('aria-owns', this.list.id);
			this.input.addEventListener('input', this.searchHandler, { passive: true });
			this.input.addEventListener('click', this.inputSelected, { passive: true });
			this.input.addEventListener('mouseover', this.autoSuggest, { once: true, passive: true });
		}
	}

	autoSuggest = () => {
		this.request(null).catch((e) => {
			console.error(e);
		});
	};

	inputSelected = (e: any): void => {
		const input = e.target.value;
		const searchInput = input ? sanitize(input) : null;

		this.request(searchInput)
			.then((response) => {
				this.DeleteResultList();
				this.createResultList(response);
			})
			.catch((e) => {
				console.error(e);
			});
	};

	searchHandler = (e: any): void => {
		const input = e.target.value;
		const searchInput = input ? sanitize(input) : null;

		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.request(searchInput)
				.then((response) => {
					this.DeleteResultList();
					this.createResultList(response);
				})
				.catch((e) => {
					console.error(e);
				});
			// update timeout time too
		}, 200);
	};

	request(search: string | null): Promise<any> {
		console.time('request');
		const cacheKey = JSON.stringify(search);
		if (this.cache[cacheKey]) return Promise.resolve(this.cache[cacheKey]);

		const options = {
			method: 'POST',
			body: JSON.stringify({
				search,
			}),
		};

		const response = fetch(this.engine, options).then((response) => response.json());
		this.cache[cacheKey] = response;

		console.timeEnd('request');
		return response;
	}

	createResultList(result: Result) {
		this.root?.classList.add('active');

		if (result.items.length) {
			if (result.type === 'suggestions') {
				const li = document.createElement('li');
				li.className = 'suggestify-banner';
				li.textContent = this.translations?.suggestions ? this.translations?.suggestions : 'Suggestions:';
				this.list!.appendChild(li);
			}

			for (let i = 0; i < result.items.length; i++) {
				const item = result.items[i];
				const li = document.createElement('li');
				const a = document.createElement('a');

				a.className = 'suggestify-link';
				a.setAttribute(
					'aria-label',
					`${this.translations?.linkLabel ? this.translations?.linkLabel : 'Search on'} ${item}`
				);
				a.href = `${this.url}${item}`;
				a.textContent = item;

				li.appendChild(a);
				this.list!.appendChild(li);
			}
		} else {
			if (result.type === 'results') {
				const li = document.createElement('li');
				li.className = 'suggestify-banner';
				li.textContent = this.translations?.results ? this.translations?.results : 'No suggestions found';
				this.list!.appendChild(li);
			}
		}
	}

	DeleteResultList() {
		if (this.list) {
			this.root?.classList.remove('active');

			Array.from(this.list.children).forEach((element: Element) => {
				this.list!.removeChild(element);
			});
		}
	}
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

export default Suggestify;
