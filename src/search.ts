import { nanoid } from 'nanoid';

interface Options {
	url?: string;
	engine?: string;
}

class Search {
	private root: Element | null;
	private url?: string;
	private engine?: string;
	private input?: Element | null;
	private result?: Element | null;

	constructor(selector: string | Element, options: Options) {
		this.root = typeof selector === 'string' ? document.querySelector(selector) : selector;
		this.url = options.url;
		this.engine = options.engine;
		this.input = this.root?.querySelector('input');
		this.result = this.root?.querySelector('ul');

		this.initialize();
	}

	initialize(): void {
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

	searchHandler = (e: Event): void => {
		console.log(e.target.value);
	};
}

export default Search;
