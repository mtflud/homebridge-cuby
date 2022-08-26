module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        '@coorpacademy/coorpacademy',
        'import',
    ],
    rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@coorpacademy/coorpacademy/jsx-no-logical-expression': 'error',
        semi: ['error', 'never'],
        'import/prefer-default-export': 'off',
    },
    // As recommended by typescript-eslint, check https://github.com/typescript-eslint/typescript-eslint/blob/main/docs/linting/TROUBLESHOOTING.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                'no-undef': 'off',
            },
        },
    ],
}
