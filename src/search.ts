import { nanoid } from 'nanoid';

interface Options {
	url?: string;
	engine?: string;
}

interface Cache {
	[key: string]: any;
}

class Search {
	private root: Element | null;
	private engine: string;
	private url: string;
	private input?: Element | null;
	private result?: Element | null;
	private cache: Cache = {};
	private timeout = 100;
	private initResults = false;

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
		this.root?.insertBefore(i, this.root?.childNodes[0]);

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
			this.input.addEventListener('click', this.inputSelected, { passive: true });
		}
	}

	inputSelected = (e: any): void => {
		const text = e.target.value;

		if (!text && !this.initResults) {
			this.request(null)
				.then((response) => {
					this.DeleteResultList();
					this.createResultList(response);
				})
				.catch((e) => {
					console.error(e);
				});

			this.initResults = true;
		}
	};

	searchHandler = (e: any): void => {
		const text = e.target.value;

		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.request(sanitize(text))
				.then((response) => {
					this.DeleteResultList();
					this.createResultList(response);
				})
				.catch((e) => {
					console.error(e);
				});
			// update timeout time too
		}, 100);
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

	createResultList(results: string[]) {
		if (this.result && results.length) {
			this.root?.classList.add('active');

			for (let i = 0; i < results.length; i++) {
				const result = results[i];
				const li = document.createElement('li');
				const a = document.createElement('a');

				a.className = 'suggestify-link';
				a.setAttribute('aria-label', `Zoeken op: ${result}`);
				a.href = `${this.url}${result}`;
				a.textContent = result;

				li.appendChild(a);
				this.result.appendChild(li);
			}
		}
	}

	DeleteResultList() {
		if (this.result) {
			this.root?.classList.remove('active');

			Array.from(this.result.children).forEach((element: Element) => {
				this.result!.removeChild(element);
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

export default Search;
