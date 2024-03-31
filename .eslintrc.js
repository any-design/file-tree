module.exports = {
  root: true,
  extends: [
    'alloy',
    'alloy/vue',
    'alloy/typescript',
  ],
  plugins: ['vue'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    project: './tsconfig.app.json',
    extraFileExtensions: ['.vue'],
  },
  rules: {
    'vue/v-on-event-hyphenation': 0,
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
