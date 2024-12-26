module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    env: {
        browser: true,
        es2020: true,
        node: true,
        jest: true
    },
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        'no-console': ['warn', { 
            allow: ['warn', 'error'] 
        }]
    },
    settings: {
        'import/resolver': {
            typescript: {}
        }
    },
    ignorePatterns: [
        'dist',
        'node_modules',
        '*.config.js'
    ]
};
