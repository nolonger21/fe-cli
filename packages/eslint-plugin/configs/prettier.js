module.exports = {
  plugins: ['prettier'],
  extends: [
    'prettier'
  ],
  rules: {
    'prettier/prettier': [1, {}, {
      usePrettierrc: true
    }]
  }
};