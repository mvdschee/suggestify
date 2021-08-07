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
