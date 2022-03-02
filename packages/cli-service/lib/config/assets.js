module.exports = (api, options, pluginConfig) => {
  const getAssetPath = require('../util/getAssetPath')
  const inlineLimit = pluginConfig.inlineLimit || 8 * 1024
  const outputAssetName = `${pluginConfig.filenameHashing ? '.[hash:8]' : ''}.[ext]`

  const genAssetSubPath = dir => {
    return getAssetPath(pluginConfig.assetsDir, `${dir}/[name]${outputAssetName}`)
  }

  api.chainWebpack(chainWebpack => {

    chainWebpack.module
      .rule('svg')
        .test(/\.(svg)(\?.*)?$/)
        .set('type', 'asset')
        .set('generator', {
          filename: genAssetSubPath('img'),
          dataUrl: pluginConfig.miniSvg ? content => {
            if (typeof content !== 'string') {
              content = content.toString();
            }
            const svgToMiniDataURI = require('mini-svg-data-uri')
            return svgToMiniDataURI(content);
          } : undefined
        })
        .set('parser', {
          dataUrlCondition: {
            maxSize: inlineLimit
          }
        })

    chainWebpack.module
      .rule('images')
        .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)
        .set('type', 'asset')
        .set('generator', {
          filename: genAssetSubPath('img')
        })

    chainWebpack.module
      .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .set('type', 'asset')
        .set('generator', {
          filename: genAssetSubPath('media')
        })

    chainWebpack.module
      .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
        .set('type', 'asset')
        .set('generator', {
          filename: genAssetSubPath('fonts')
        })
  })

}

module.exports.defaultConfig = {
  inlineLimit: 4 * 1024,
  miniSvg: true
}