module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const getAssetPath = require('../util/getAssetPath')

    const inlineLimit = 4096

    const genUrlLoaderOptions = dir => {
      return {
        limit: inlineLimit,
        fallback: {
          loader: require.resolve('file-loader'),
          options: {
            name: getAssetPath(options, `${dir}/[name].[contenthash:8].[ext]`)
          }
        }
      }
    }

    webpackConfig.module
      .rule('images')
        .test(/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('img'))

    webpackConfig.module
      .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('media'))

    webpackConfig.module
      .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('fonts'))
  })

}
