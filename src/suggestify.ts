import { nanoid } from 'nanoid';
import { sanitize, setAttributes, switchFn } from './utils';
export interface Options {
	url?: string;
	engine?: string;
	class?: string;
	blur?: boolean;
	icon?: boolean;
	instant?: boolean;
	translations?: Translations;
}

export interface Translations {
	suggestions: string;
	results: string;
}

export interface Cache {
	[key: string]: Result;
}

export interface Result {
	type: 'results' | 'suggestions' | 'empty';
	items: string[];
	time: number;
}

class Suggestify {
	// options
	private engine: string;
	private class: string;
	private url: string;
	private blur: boolean;
	private instant: boolean;
	private t: Translations | null;
	private icon: boolean;
	// Elements
	private root: HTMLElement | null;
	private input?: HTMLInputElement | null;
	private clearBtn?: HTMLButtonElement | null;
	private submitBtn?: HTMLButtonElement | null;
	private list: HTMLUListElement | null = null;
	// data
	private listItems: HTMLLIElement[] = [];
	private selectedIndex: number = -1;
	private searchInput: string | null = null;
	private cache: Cache = {};
	private timeout: number | any = 250;

	constructor(selector: string | HTMLElement, options: Options) {
		// HTML
		this.root = typeof selector === 'string' ? document.querySelector(selector) : selector;
		this.input = this.root && this.root.querySelector('input');
		this.clearBtn = this.root && (this.root.querySelector('button:not([type="submit"])') as HTMLButtonElement);
		this.submitBtn = this.root && (this.root.querySelector('button[type="submit"]') as HTMLButtonElement);

		// options
		this.url = options.url || '?q=';
		this.class = options.class || 'suggestify';
		this.blur = options.blur !== undefined ? options.blur : true;
		this.instant = options.instant !== undefined ? options.instant : false;
		this.icon = options.icon !== undefined ? options.icon : true;
		this.t = options.translations || null;
		this.engine = options.engine || '/api/search';

		this.initialize();
	}

	initialize(): void {
		if (!this.root) throw new Error('Selector not found');
		if (!this.input) throw new Error('Input field missing');

		this.initializeDOM();

		this.input.addEventListener('input', this.searchInputHandler, { passive: true });
		this.input.addEventListener('click', this.inputSelected, { passive: true });
		this.input.addEventListener('keydown', this.keyHandler, { passive: true });

		this.clearBtn && this.clearBtn.addEventListener('click', this.clearInput, { passive: true });
		this.submitBtn && this.submitBtn.addEventListener('click', this.directSearch, { passive: true });

		if (this.blur) this.input.addEventListener('blur', this.handleBlur, { passive: true });

		if (this.instant) this.autoSuggest();
		else this.input.addEventListener('mouseover', this.autoSuggest, { once: true, passive: true });
	}

	/**
	 * @description Update all HTML elements and creat new once
	 * @returns void
	 */
	initializeDOM() {
		const listId = `${this.class}-results-${nanoid(5)}`;

		// root
		this.root!.className = this.class;
		this.root!.setAttribute('role', 'search');

		// input
		setAttributes(this.input!, {
			class: `${this.class}-input`,
			role: 'combobox',
			autocomplete: 'off',
			autocapitalize: 'off',
			autocorrect: 'off',
			spellcheck: 'off',
			'aria-autocomplete': 'list',
			'aria-haspopup': 'listbox',
			'aria-expanded': 'false',
			'aria-owns': listId,
		});

		this.searchInput = this.input!.value;

		// icon
		if (this.icon) {
			const icon = document.createElement('i');

			setAttributes(icon, {
				class: `${this.class}-icon`,
				role: 'presentation',
				focusable: 'false',
				'aria-hidden': 'true',
			});

			const _icon = icon.cloneNode(false);

			this.clearBtn!.appendChild(icon);
			this.submitBtn!.appendChild(_icon);
		}

		// button
		setAttributes(this.clearBtn!, {
			class: `${this.class}-clear`,
			hidden: '',
		});

		// button submit
		this.submitBtn!.className = `${this.class}-submit`;

		// list
		this.list = document.createElement('ul');

		setAttributes(this.list, {
			id: listId,
			class: `${this.class}-results`,
			role: 'listbox',
		});

		this.root?.appendChild(this.list);
	}

	/**
	 * @description Deletes results items on blur
	 * @returns void
	 */
	handleBlur = (): void => {
		setTimeout(() => {
			this.deleteResultList();
		}, 100);
	};

	/**
	 * @description Show list on click
	 * @returns void
	 */
	inputSelected = (): void => {
		this.request(this.searchInput)
			.then((response) => {
				this.deleteResultList();
				this.createResultList(response);
			})
			.catch((e: Error) => {
				throw new Error(e.message);
			});
	};

	/**
	 * @description clear input and close list
	 * @returns void
	 */
	clearInput = (): void => {
		this.searchInput = null;
		this.input!.value = '';

		this.deleteResultList();

		if (this.clearBtn) this.clearBtn.hidden = true;
	};

	/**
	 * @description Will use input to go to search page or
	 * use selected index item
	 * @returns void
	 */
	directSearch = (): void => {
		if (this.selectedIndex !== -1) {
			const item = this.listItems[this.selectedIndex];
			window.location.href = `${this.url}${item.id.replace('_', ' ')}`;
		} else if (this.searchInput) window.location.href = `${this.url}${this.searchInput}`;
	};

	selectItemUp = (): void => {
		const total = this.listItems.length - 1;
		const current = this.listItems[this.selectedIndex];

		if (current) current.classList.remove('selected');

		if (this.selectedIndex <= 0) this.selectedIndex = total;
		else this.selectedIndex--;

		const prev = this.listItems[this.selectedIndex];

		if (prev) {
			this.input!.setAttribute('aria-activedescendant', prev.id);
			prev.classList.add('selected');
		}
	};

	selectItemDown = (): void => {
		const total = this.listItems.length - 1;
		const current = this.listItems[this.selectedIndex];

		if (current) current.classList.remove('selected');

		if (this.selectedIndex === total) this.selectedIndex = 0;
		else this.selectedIndex++;

		const next = this.listItems[this.selectedIndex];

		if (next) {
			this.input!.setAttribute('aria-activedescendant', next.id);
			next.classList.add('selected');
		}
	};

	keyHandler = ({ key }: KeyboardEvent): void => {
		const cases = {
			Enter: this.directSearch,
			Escape: this.deleteResultList,
			ArrowUp: this.selectItemUp,
			ArrowDown: this.selectItemDown,
			_default: () => null,
		};
		const keySwitch = switchFn(cases, '_default');

		keySwitch(key);
	};

	/**
	 * @description Calls server for initial suggestions
	 * @returns void
	 */
	autoSuggest = (): void => {
		this.request(this.searchInput)
			.then((response) => {
				if (this.instant) {
					this.createResultList(response);
				}
			})
			.catch((e: Error) => {
				throw new Error(e.message);
			});
	};

	/**
	 * @description Handle new search input with call to server
	 * @returns void
	 */
	searchInputHandler = ({ target }: Event): void => {
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			const input = (target as HTMLInputElement).value.trim();

			this.searchInput = input ? sanitize(input) : null;

			if (input && this.clearBtn) this.clearBtn.hidden = false;
			else if (this.clearBtn) this.clearBtn.hidden = true;

			this.request(this.searchInput)
				.then((response) => {
					this.deleteResultList();
					this.createResultList(response);
				})
				.catch((e: Error) => {
					throw new Error(e.message);
				});
		}, 250);
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

	banner = (type: string): void => {
		const banner = document.createElement('li');
		banner.className = `${this.class}-banner`;

		if (type === 'suggestions') banner.textContent = this.t?.suggestions ? this.t?.suggestions : 'Suggestions';
		if (type === 'empty') banner.textContent = this.t?.results ? this.t?.results : 'No suggestions found';

		if (type !== 'results') this.list!.appendChild(banner);
	};

	createResultList(result: Result): void {
		this.root!.classList.add('expanded');
		this.list!.setAttribute('aria-expanded', 'true');
		this.input!.setAttribute('aria-activedescendant', '');

		// create banner
		this.banner(result.type);

		if (result.items.length) {
			for (let i = 0; i < result.items.length; i++) {
				const li = document.createElement('li');
				const a = document.createElement('a');
				const item = result.items[i];

				setAttributes(a, {
					class: `${this.class}-link`,
					href: `${this.url}${item}`,
				});

				if (result.type === 'results') {
					const words = this.searchInput ? this.searchInput.split(' ') : [];
					let text = item;

					for (let i = 0; i < words.length; i++) {
						const word = words[i];
						text = text.replace(word, `<b>${word}</b>`);
					}

					a.innerHTML = text;
				} else a.textContent = item;

				li.id = item.replace(' ', '_');

				li.appendChild(a);
				this.listItems.push(li);
			}
		} else {
			const li = document.createElement('li');
			const a = document.createElement('a');

			setAttributes(a, {
				class: `${this.class}-link`,
				href: `${this.url}${this.searchInput}`,
			});

			a.textContent = this.searchInput;

			li.appendChild(a);
			this.listItems.push(li);
		}

		for (let i = 0; i < this.listItems.length; i++) {
			this.list!.appendChild(this.listItems[i]);
		}
	}

	deleteResultList = (): void => {
		this.root!.classList.remove('expanded');
		this.input!.setAttribute('aria-expanded', 'false');
		this.input!.setAttribute('aria-activedescendant', '');
		this.list!.innerHTML = '';
		this.listItems = [];
		this.selectedIndex = -1;
	};
}

export default Suggestify;
