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
declare class Suggestify {
	private engine;
	private class;
	private url;
	private blur;
	private instant;
	private t;
	private icon;
	private root;
	private input?;
	private clearBtn?;
	private submitBtn?;
	private list;
	private listItems;
	private selectedIndex;
	private searchInput;
	private cache;
	private timeout;
	constructor(selector: string | HTMLElement, options: Options);
	initialize(): void;
	/**
	 * @description Update all HTML elements and creat new once
	 * @returns void
	 */
	initializeDOM(): void;
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
	 * @description clear input and close list
	 * @returns void
	 */
	clearInput: () => void;
	/**
	 * @description Will use input to go to search page or
	 * use selected index item
	 * @returns void
	 */
	directSearch: () => void;
	selectItemUp: () => void;
	selectItemDown: () => void;
	keyHandler: ({ key }: KeyboardEvent) => void;
	/**
	 * @description Calls server for initial suggestions
	 * @returns void
	 */
	autoSuggest: () => void;
	/**
	 * @description Handle new search input with call to server
	 * @returns void
	 */
	searchInputHandler: ({ target }: Event) => void;
	/**
	 * @description Deletes results items on blur
	 * @returns void
	 */
	request(search: string | null): Promise<Result>;
	banner: (type: string) => void;
	createResultList(result: Result): void;
	deleteResultList: () => void;
}
export default Suggestify;
