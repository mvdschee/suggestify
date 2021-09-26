export interface Options {
    url?: string;
    engine?: string;
    class?: string;
    blur?: boolean;
    icon?: boolean;
    instant?: boolean;
    translations?: Translations;
    onComplete?: ({ value, success }: OnCompleteObject) => Promise<boolean>;
}
export interface OnCompleteObject {
    value: string;
    success: 'HIT' | 'MISS';
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
    private onComplete;
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
    /**
     * @description Function to call the server with build in caching for search results
     */
    request(search: string | null): Promise<Result>;
    /**
     * @description Create a banner with a message based on the 3 states
     */
    banner: (type: string) => void;
    linkHandler: (e: Event, result: string) => void;
    /**
     * @description Create list items which has 3 states
     * - `empty` create banner with message and search input as item
     * - `results` create banner with message and 7 results
     * - `suggestions` create banner with inital 7 pre-set results
     */
    createResultList(result: Result): void;
    /**
     * @description Delete all items in the list and reset values to unselected state
     */
    deleteResultList: () => void;
}
export default Suggestify;
