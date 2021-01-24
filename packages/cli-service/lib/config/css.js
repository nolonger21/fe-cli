const fs = require('fs')
const path = require('path')

const findExisting = (context, files) => {
  for (const file of files) {
    if (fs.existsSync(path.join(context, file))) {
      return file
    }
  }
}

module.exports = (api, options, pluginConfig) => {

  api.chainWebpack(chainWebpack => {
    const getAssetPath = require('../util/getAssetPath')
    const isProd = process.env.NODE_ENV == 'production'

    const {
      extract = isProd,
      sourceMap = false,
      loaderOptions = {}
    } = pluginConfig.css || {}

    // When it's not extracted, the CSS is in JS, and it's rendered dynamically
    const shouldExtract = extract
    const needInlineMinification = isProd && !shouldExtract
    const outputAssetName = `${pluginConfig.filenameHashing ? '.[contenthash:8]' : ''}.css`
    const filename = getAssetPath(pluginConfig.assetsDir, `css/[name]${outputAssetName}`)
  
    const extractOptions = {
      filename,
      chunkFilename: filename
    }

    // use relative publicPath in extracted CSS based on extract location
    const cssPublicPath = '../'.repeat(
        extractOptions.filename
            .replace(/^\.[\/\\]/, '')
            .split(/[\/\\]/g)
            .length - 1
      )

    const hasPostCSSConfig = !!(loaderOptions.postcss || api.service.pkg.postcss || findExisting(api.resolve('.'), [
      '.postcssrc',
      '.postcssrc.js',
      'postcss.config.js',
      '.postcssrc.yaml',
      '.postcssrc.json'
    ]))
    
    if (!hasPostCSSConfig) {
      loaderOptions.postcss = {
        plugins: [
          require('autoprefixer')({
            overrideBrowserslist: [ "> 1%", 'last 2 versions']
          })
        ]
      }
    }

    const cssnanoOptions = {
      preset: ['default', {
        mergeLonghand: false,
        cssDeclarationSorter: false
      }]
    }

    if (pluginConfig.productionSourceMap && sourceMap) {
      cssnanoOptions.map = { inline: false }
    }

    function createCSSRule (lang, test, loader, ruleOtions) {
      const baseRule = chainWebpack.module.rule(lang).test(test)
      const normalRule = baseRule.oneOf('normal')
      applyLoaders(normalRule)

      function applyLoaders (rule) {
        if (shouldExtract) {
          // production mode extract css
          rule
            .use('extract-css-loader')
            .loader(require('mini-css-extract-plugin').loader)
            .options({
              hmr: !isProd,
              publicPath: cssPublicPath
            })
        } else {
          // development mode inline css
          rule
            .use('style-loader')
            .loader(require.resolve('style-loader'))
        }

        rule
          .use('css-loader')
          .loader(require.resolve('css-loader'))
          .options(Object.assign({
            sourceMap,
            importLoaders: (
              (needInlineMinification ? 1 : 0) +  // cssnano minification
              1 + // postcss-loader
              (loader ? 1 : 0) // other loader
            )
          }, loaderOptions.css))

        if (needInlineMinification) {
          rule
            .use('cssnano')
            .loader(require.resolve('postcss-loader'))
            .options({
              sourceMap,
              plugins: [require('cssnano')(cssnanoOptions)]
            })
        }

        rule
          .use('postcss-loader')
          .loader(require.resolve('postcss-loader'))
          .options(Object.assign({ sourceMap }, loaderOptions.postcss))

        if (loader) {
          let resolvedLoader
          try {
            resolvedLoader = require.resolve(loader)
          } catch (error) {
            resolvedLoader = loader
          }

          rule
            .use(loader)
            .loader(resolvedLoader)
            .options(Object.assign({ sourceMap }, ruleOtions))
        }
      }
    }

    createCSSRule('css', /\.css$/)
    createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less)
    createCSSRule('scss', /\.scss$/, 'sass-loader', Object.assign({ implementation: require('sass') },loaderOptions.scss))
    createCSSRule('sass', /\.sass$/, 'sass-loader', Object.assign(
      { implementation: require('sass') },
      loaderOptions.sass,
      { sassOptions: Object.assign({}, loaderOptions.sass && loaderOptions.sass.sassOptions, { indentedSyntax: true })}
    ))
    createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', Object.assign({ preferPathResolver: 'webpack' }, loaderOptions.stylus))
    createCSSRule('postcss', /\.p(ost)?css$/)

    if (shouldExtract) {
      chainWebpack
        .plugin('extract-css')
          .use(require('mini-css-extract-plugin'), [extractOptions])

      if (isProd) {
        chainWebpack
          .plugin('optimize-css')
            .use(require('@intervolga/optimize-cssnano-plugin'), [{
              sourceMap: pluginConfig.productionSourceMap && sourceMap,
              cssnanoOptions
            }])
      }
    }
  })
}

module.exports.defaultConfig = {
  css: {
    extract: true,
    sourceMap: false,
    loaderOptions: {
      css: undefined,
      less: undefined,
      scss: undefined,
      stylus: undefined,
      postcss: undefined
    }
  }
}