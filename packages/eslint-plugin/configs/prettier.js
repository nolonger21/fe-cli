module.exports = {
  plugins: ['prettier'],
  extends: [
    'prettier'
  ],
  rules: {
    'prettier/prettier': [1, {
      // printWidth: 120,
      // tabWidth: 2,
      // useTabs: false,
      // singleQuote: true, // -> project root .prettierrc.js
      // semi: false,
      // trailingComma: 'es5',
      // bracketSpacing: true
    }, {
      usePrettierrc: true
    }]
  }
};