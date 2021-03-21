
const vueTsConfig = require('./vue-typescript')

module.exports = {
  extends: [
    require.resolve('./vue3')
  ],
  overrides: vueTsConfig.overrides
};