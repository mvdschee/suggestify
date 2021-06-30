import './style.scss';
import { nanoid } from 'nanoid';
import { sanitize } from './utils/sanitizer';
import { switchFn } from './utils/switch';

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
	[key: string]: Result;
}

export interface Result {
	type: 'results' | 'suggestions';
	items: string[];
}

class Suggestify {
	private root: HTMLElement | null;
	private engine: string;
	private url: string;
	private input?: HTMLInputElement | null;
	private list?: HTMLElement | null;
	private translations: Translations | null;
	private cache: Cache = {};
	private searchInput: string | null;
	private timeout = 200;

	constructor(selector: string | HTMLElement, options: Options) {
		this.root = typeof selector === 'string' ? document.querySelector(selector) : selector;
		this.url = options.url || '?q=';
		this.searchInput = null;
		this.translations = options.translations || null;
		this.engine = options.engine || '/api/search';
		this.input = this.root?.querySelector('input');
		this.list = this.root?.querySelector('ul');

		if (this.root) this.initialize();
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

			this.searchInput = this.input.value;

			this.list.setAttribute('role', 'listbox');
			if (!this.list.id) this.list.id = `suggestify-result-${nanoid(5)}`;

			this.input.setAttribute('aria-owns', this.list.id);
			this.input.addEventListener('input', this.searchHandler, { passive: true });
			this.input.addEventListener('click', this.inputSelected, { passive: true });
			this.input.addEventListener('keydown', this.keyHandler, { passive: true });
			this.input.addEventListener('mouseover', this.autoSuggest, { once: true, passive: true });
			this.input.addEventListener('blur', this.handleBlur, { passive: true });

			const pre = document.createElement('link');
			pre.setAttribute('rel', 'preconnect');
			pre.href = this.engine;

			document.body.appendChild(pre);
		}
	}

	/**
	 * @description Calls server for initial suggestions
	 * @returns void
	 */
	autoSuggest = (): void => {
		this.request(this.searchInput).catch((e: Error) => {
			throw new Error(e.message);
		});
	};

	/**
	 * @description Deletes results items on blur
	 * @returns void
	 */
	handleBlur = (): void => {
		setTimeout(() => {
			this.DeleteResultList();
		}, 100);
	};

	/**
	 * @description Show list on click
	 * @returns void
	 */
	inputSelected = (): void => {
		this.request(this.searchInput)
			.then((response) => {
				this.DeleteResultList();
				this.createResultList(response);
			})
			.catch((e: Error) => {
				throw new Error(e.message);
			});
	};

	EnterHandler = () => {
		if (this.searchInput) window.location.href = `${this.url}${this.searchInput}`;
	};

	keyHandler = ({ key }: KeyboardEvent): void => {
		const cases = {
			Enter: this.EnterHandler,
			Escape: this.DeleteResultList,
			_default: () => null,
		};
		const keySwitch = switchFn(cases, '_default');

		keySwitch(key);
	};

	/**
	 * @description Handle new search input with call to server
	 * @returns void
	 */
	searchHandler = ({ target }: Event): void => {
		const input = (target as HTMLInputElement).value;
		this.searchInput = input ? sanitize(input) : null;

		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.request(this.searchInput)
				.then((response) => {
					this.DeleteResultList();
					this.createResultList(response);
				})
				.catch((e: Error) => {
					throw new Error(e.message);
				});
			// update timeout time too
		}, 200);
	};

	/**
	 * @description Deletes results items on blur
	 * @returns void
	 */
	async request(search: string | null): Promise<Result> {
		const cacheKey = JSON.stringify(search);
		if (this.cache[cacheKey]) return this.cache[cacheKey];

		const options = {
			method: 'POST',
			body: JSON.stringify({
				search,
			}),
		};

		const response: Result = await fetch(this.engine, options).then((response) => response.json());
		this.cache[cacheKey] = response;

		return response;
	}

	createResultList(result: Result): void {
		this.root!.classList.add('active');
		this.input!.setAttribute('aria-expanded', 'true');

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
				const banner = document.createElement('li');
				const li = document.createElement('li');
				const a = document.createElement('a');

				banner.className = 'suggestify-banner';
				banner.textContent = this.translations?.results ? this.translations?.results : 'No suggestions found';

				a.className = 'suggestify-link';
				a.setAttribute(
					'aria-label',
					`${this.translations?.linkLabel ? this.translations?.linkLabel : 'Search on'} ${this.searchInput}`
				);
				a.href = `${this.url}${this.searchInput}`;
				a.textContent = this.searchInput;

				li.appendChild(a);
				this.list!.appendChild(banner);
				this.list!.appendChild(li);
			}
		}
	}

	DeleteResultList = (): void => {
		this.root!.classList.remove('active');
		this.input!.setAttribute('aria-expanded', 'false');
		this.list!.innerHTML = '';
	};
}

export default Suggestify;
