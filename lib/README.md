# 🕵 Suggestify

**Fully accessible search box with suggestions (Suggestions served by serverless function)**

Please note: this project is a personal project I made available and will probably keep changing things to my liking or personal usage. Also, the serverless function with the suggestion logic is not included; I'm working on it and want to keep it for myself for now :)

### 🌎 Browser support

-   Chrome
-   Edge (Chrome)
-   Firefox
-   Safari

# 🐎 Getting started

### Install

```bash
$ yarn add suggestify
```

```js
// import Suggestify
import Suggestify from 'suggestify';

// Init and config
new Suggestify(...);
```

### Configure

The selector can either be a `string` or `HTMLElement`

```js
new Suggestify('#sugestify', {
	// Redirect url with search input
	url: '/search?q=', // default: ?q=

	// Suggestion engine url
	engine: 'https://example.com/search-api', // default: /api/search

	// Class to add to elements
	class: 'my-class', // default: suggestify

	// Remove suggestions if user clicks outside search box
	blur: true, // default: true

	// Add <i> in button element for custom icon styling
	icon: true, // default: true

	// Give suggestions instantly on load
	instant: false, // default: false

	// Translations for banner text
	translations: {
		suggestions: 'Most used search results', // default: Suggestions
		results: 'Nothing to see', // default: No suggestions found
	},
});
```

### 🎉 Styling

`scss` is included and only works with `suggestify` class.

```scss
@import 'suggestify/style.scss';
```

The cleaner version is to copy the styling and adjust it to your liking.

# 👨‍💻 Development

[See GitHub Page](https://github.com/mvdschee/suggestify)
