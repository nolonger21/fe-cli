
const vueConfig = require('./vue')

module.exports = {
  ...vueConfig,
  extends: [
    ...vueConfig.extends.slice(0,1),
    'plugin:vue/vue3-recommended'
  ]
};
  