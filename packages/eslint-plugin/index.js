

module.exports = {
  configs: {
    /** project extends **/

    // js
    base: require('./configs/base'),
    recommended: require('./configs/recommended'),

    // ts
    typescript: require('./configs/typescript'),

    // vue
    vue: require('./configs/vue'),
    'vue-typescript': require('./configs/vue-typescript'),

    // vue3
    vue3: require('./configs/vue3'),
    'vue3-typescript': require('./configs/vue3-typescript'),

    // react
    react: require('./configs/react'),
    'react-typescript': require('./configs/react-typescript'),

    /** eslint fix rules for prettier **/
    prettier: require('./configs/prettier'),
    'prettier-typescript': require('./configs/prettier-typescript'),
    'prettier-vue': require('./configs/prettier-vue'),
    'prettier-react': require('./configs/prettier-react')
  }
}
