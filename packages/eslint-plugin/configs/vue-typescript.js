
const vueConfig = require('./vue')
const typescriptConfig = require('./typescript');

const typescriptOverrides = typescriptConfig.overrides[0]

module.exports = {
  extends: [
    require.resolve('./vue')
  ],
  overrides: [
    {
      files: typescriptOverrides.files.concat(['*.vue']),
      parser: vueConfig.parser,
      parserOptions: {
        ...typescriptOverrides.parserOptions,
        parser: typescriptOverrides.parser,
        extraFileExtensions: ['.vue'],
      },
      plugins: typescriptOverrides.plugins,
      extends: typescriptOverrides.extends,
      rules: typescriptOverrides.rules
    },
    {
      files: ['*.vue'],
      rules: Object.assign({},{
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0
      })
    },
    {
      files: ['shims-tsx.d.ts'],
      rules: {
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-unused-vars': 0
      }
    }
  ]
};