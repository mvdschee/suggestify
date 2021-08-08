# 🕵 Suggestify

#### **Suggestions based on a data set provided by a serverless function (not included).**

Please note: this project is still under heavy development, and I will not bother with backward compatibility of any sort; please if you want to use it, clone the repo :)

## 🌎 Browser support

-   Chrome
-   Edge (Chrome)
-   Firefox
-   Safari

# Developement

## 📦 Requirments

-   [Node.js v14 or higher](https://nodejs.org/en/)
-   [Yarn v1.22 or higher](https://yarnpkg.com/lang/en/)
-   ☕ Coffee

# 🐎 QuickStart

## Development

1. Type in the terminal:

    ```bash
    # install dependencies
    $ yarn

    # served at localhost:3000
    $ yarn dev
    ```

2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

3. Add a search engine (not included, see data model) and provide the URL in `src/main.ts`

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
