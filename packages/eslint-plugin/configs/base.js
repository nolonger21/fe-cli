module.exports = {
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true
  },
  parser: require.resolve('babel-eslint'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
      globalReturn: false,
    },
    requireConfigFile: false,
    allowImportExportEverywhere: false
  },
  extends: [],
  rules: {
  }
}
