module.exports = (api, options, pluginConfig) => {

  api.chainWebpack(chainWebpack => {
    const getAssetPath = require('../util/getAssetPath')
    const inlineLimit = pluginConfig.inlineLimit || 4096
    const outputAssetName = `${pluginConfig.filenameHashing ? '.[hash:8]' : ''}.[ext]`

    const genUrlLoaderOptions = dir => {
      return {
        limit: inlineLimit,
        fallback: {
          loader: require.resolve('file-loader'),
          options: {
            name: getAssetPath(pluginConfig.assetsDir, `${dir}/[name]${outputAssetName}`),
            esModule: false
          }
        }
      }
    }

    chainWebpack.module
      .rule('images')
        .test(/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('img'))

    chainWebpack.module
      .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('media'))

    chainWebpack.module
      .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('fonts'))
  })

}

module.exports.defaultConfig = {
  inlineLimit: 4096
}