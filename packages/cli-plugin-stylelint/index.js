const path = require('path')

module.exports = (api, options, pluginConfig) => {
  const { error, info, warn, resolveModule, loadModule, tryRequire } = require('@etherfe/cli-utils')
  const cwd = api.getCwd()
  const stylelintPkg = loadModule('stylelint/package.json', cwd, true)

  if (!stylelintPkg) {
    error( `The project seems to require 'stylelint' but it's not installed.`)
    process.exit(1)
  }

  api.chainWebpack(chainWebpack => {
    chainWebpack
      .plugin('stylelint')
        .use(require.resolve('stylelint-webpack-plugin'), [{
          context: api.resolve('src'),
          files: ['**/*.{html,vue,css,sass,scss,less,styl}'],
          cache: true,
          cacheLocation: api.resolve('node_modules/.cache/.stylelintcache/'),
          ...pluginConfig.stylelintOptions
        }])
  })

}

module.exports.defaultConfig = {
  stylelintOptions: {
    cache: true,
    fix: false,
    emitErrors: true,
    failOnError: false,
    lintDirtyModulesOnly: false
  }
}