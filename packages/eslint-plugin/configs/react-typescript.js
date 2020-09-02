
const typescriptConfig = require('./typescript');

const typescriptOverrides = typescriptConfig.overrides[0]

module.exports = {
  extends: [
    require.resolve('./react')
  ],
  overrides: [
    typescriptOverrides
  ]
};