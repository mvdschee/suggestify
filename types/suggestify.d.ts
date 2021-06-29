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
declare class Suggestify {
	private root;
	private engine;
	private url;
	private input?;
	private list?;
	private translations;
	private cache;
	private timeout;
	constructor(selector: string | Element, options: Options);
	initialize(): void;
	autoSuggest: () => void;
	inputSelected: (e: any) => void;
	searchHandler: (e: any) => void;
	request(search: string | null): Promise<any>;
	createResultList(result: Result): void;
	DeleteResultList(): void;
}
export default Suggestify;
