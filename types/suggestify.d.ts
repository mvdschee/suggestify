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
declare class Suggestify {
	private root;
	private engine;
	private url;
	private input?;
	private list?;
	private translations;
	private cache;
	private searchInput;
	private timeout;
	constructor(selector: string | HTMLElement, options: Options);
	initialize(): void;
	/**
	 * @description Calls server for initial suggestions
	 * @returns void
	 */
	autoSuggest: () => void;
	/**
	 * @description Deletes results items on blur
	 * @returns void
	 */
	handleBlur: () => void;
	/**
	 * @description Show list on click
	 * @returns void
	 */
	inputSelected: () => void;
	/**
	 * @description Handle new search input with call to server
	 * @returns void
	 */
	searchHandler: ({ target }: Event) => void;
	/**
	 * @description Deletes results items on blur
	 * @returns void
	 */
	request(search: string | null): Promise<Result>;
	createResultList(result: Result): void;
	DeleteResultList(): void;
}
export default Suggestify;
