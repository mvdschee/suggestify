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
    initializeDOM(): void;
    handleBlur: () => void;
    inputSelected: () => void;
    clearInput: () => void;
    directSearch: () => void;
    selectItemUp: () => void;
    selectItemDown: () => void;
    keyHandler: ({ key }: KeyboardEvent) => void;
    autoSuggest: () => void;
    searchInputHandler: ({ target }: Event) => void;
    request(search: string | null): Promise<Result>;
    banner: (type: string) => void;
    createResultList(result: Result): void;
    deleteResultList: () => void;
}
export default Suggestify;
