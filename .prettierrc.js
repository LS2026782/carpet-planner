module.exports = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    bracketSpacing: true,
    arrowParens: 'avoid',
    endOfLine: 'auto',
    overrides: [
        {
            files: '*.{json,yml,yaml,md}',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
