module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    '@tencent/eslint-config-tencent',
    '@tencent/eslint-config-tencent/ts',
    '@tencent/eslint-config-tencent/prettier',
  ],
  plugins: ['vue'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    project: './tsconfig.app.json',
    extraFileExtensions: ['.vue'],
  },
  overrides: [
    {
      files: [
        'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'
      ],
      'extends': [
        'plugin:cypress/recommended'
      ]
    }
  ],
};
