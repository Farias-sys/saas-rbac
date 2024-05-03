/** @typedef {import('prettier').Config} PrettierConfig */

/**@type {PrettierConfig} */
const config = {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,
    trailingComma: 'es5',
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'crlf',
    bracketSameLine: false
}

export default config;