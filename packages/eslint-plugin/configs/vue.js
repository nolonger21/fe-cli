

module.exports = {
  parser: require.resolve('vue-eslint-parser'),
  parserOptions: {
    parser: require.resolve('babel-eslint')
  },
  plugins: ['vue'],
  extends: [
    require.resolve('./recommended'),
    'plugin:vue/recommended'
  ],
  rules: {
    'vue/max-attributes-per-line': [2, {
      "singleline": 8,
      "multiline": {
        "max": 1,
        "allowFirstLine": false
      }
    }],
    'vue/singleline-html-element-content-newline': 0,
    "vue/html-self-closing": [1,{
      "html": {
        "void": "always",
        "normal": "always",
        "component": "always"
      },
      "svg": "always",
      "math": "always"
    }]
  }
};
