module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const resolveLocal = require('../util/resolveLocal')
    const { resolveClientEnv, resolveEntryIndex } = require('@etherfe/cli-utils')
    
    let entryFile = !Object.keys(options.entry).length ? resolveEntryIndex(api.service.context) : ''
    let outPutPath = options.output.path
    let publicPath = options.output.publicPath

    // base config
    webpackConfig
      .mode('development')
      .context(api.service.context)
      
    if(entryFile) {
      webpackConfig
        .entry('app')
          .add(entryFile)
          .end()
    }

    webpackConfig
      .output
        .path(api.resolve(outPutPath))
        .filename('[name].js')
        .publicPath(publicPath)
        .globalObject(`(typeof self !== 'undefined' ? self : this)`)

    webpackConfig.resolve
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))
        .add(resolveLocal('node_modules'))
        .end()
      .extensions
        .merge(['.mjs','.cjs', '.js', '.jsx', '.json', '.wasm'])
        .end()
      .alias
        .set('@', api.resolve('src'))

    webpackConfig.module
      .noParse(/jquery|lodash/)

    webpackConfig.node
      .merge({
        __filename: true,
        __dirname: true
      })

    // base plugins
    webpackConfig
      .plugin('define')
        .use(require('webpack/lib/DefinePlugin'), [
          resolveClientEnv(options)
        ])

    webpackConfig
      .plugin('progress')
        .use(require('webpack/lib/ProgressPlugin'))

    webpackConfig
      .plugin('case-sensitive-paths')
        .use(require('case-sensitive-paths-webpack-plugin'))

    const { transformer, formatter } = require('../util/resolveLoaderError')
    webpackConfig
      .plugin('friendly-errors')
        .use(require('@soda/friendly-errors-webpack-plugin'), [{
          additionalTransformers: [transformer],
          additionalFormatters: [formatter]
        }])
  })

  // api.resolveChainableWebpackConfig();
}
