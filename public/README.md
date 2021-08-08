# 🕵 Suggestify

#### **Suggestions based on a data set provided by a serverless function (not included).**

Please note: this project is still under heavy development, and I will not bother with backward compatibility of any sort; please if you want to use it, clone the repo :)

## 🌎 Browser support

-   Chrome
-   Edge (Chrome)
-   Firefox
-   Safari

## How to use

```js
import Suggestify from './suggestify.js';

new Suggestify('#suggestify', {
	engine: '/api/search',
	class: 'suggestify',
	url: '/search?q=',
});
```

## Data model

The search engine is not included in the project, just because I didn't feel like making it public for now. Instead, I will provide you with the output, which you can use to build it yourself.

Three types are used for different cases

1. suggestions: is used for initial suggestions
2. results: for normal search results
3. empty: if no results are found

```js
{
    type: 'results' | 'suggestions' | 'empty',
    items: ['item', ...],
    time: 0.01 // calculation time in seconds
}
```
