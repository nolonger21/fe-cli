module.exports = (api, options, pluginConfig) => {
  
  api.chainWebpack(chainWebpack => {
    const resolveLocal = require('../util/resolveLocal')
    const { resolveClientEnv, resolveEntryIndex } = require('@etherfe/cli-utils')
    
    const entryFile = !Object.keys(options.entry).length ? resolveEntryIndex(api.service.context) : ''
    const outPutPath = options.output.path
    const publicPath = options.output.publicPath
    const clientEnv = resolveClientEnv(/^APP_/, {
      BASE_URL: publicPath
    })
  
    // base config
    chainWebpack
      .mode('development')
      .context(api.service.context)

    if(entryFile) {
      chainWebpack
        .entry('app')
          .add(entryFile)
          .end()
    }

    chainWebpack
      .output
        .path(api.resolve(outPutPath))
        .filename('[name].js')
        .publicPath(publicPath)
        .globalObject(`(typeof self !== 'undefined' ? self : this)`)

    chainWebpack.resolve
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

    chainWebpack.module
      .noParse(/jquery|lodash/)

    chainWebpack.node
      .merge({
        __filename: true,
        __dirname: true
      })

    // base plugins
    chainWebpack
      .plugin('define')
        .use(require('webpack/lib/DefinePlugin'), [
          clientEnv
        ])

    chainWebpack
      .plugin('progress')
        .use(require('webpack/lib/ProgressPlugin'))

    chainWebpack
      .plugin('case-sensitive-paths')
        .use(require('case-sensitive-paths-webpack-plugin'))

    const { transformer, formatter } = require('../util/resolveLoaderError')
    chainWebpack
      .plugin('friendly-errors')
        .use(require('@soda/friendly-errors-webpack-plugin'), [{
          additionalTransformers: [transformer],
          additionalFormatters: [formatter]
        }])
  })

}

module.exports.defaultConfig = {

}