const fs = require('fs')
const path = require('path')

const findExisting = (context, files) => {
  for (const file of files) {
    if (fs.existsSync(path.join(context, file))) {
      return file
    }
  }
}

module.exports = (api, options) => {
  api.chainWebpack(chainWebpack => {
    const getAssetPath = require('../util/getAssetPath')
    const isProd = process.env.NODE_ENV == 'production'

    const { sourceMap = false } = {};

    const shouldExtract = isProd
    const filename = getAssetPath(options, `css/[name].[contenthash:8].css`)
    const extractOptions = {
      filename,
      chunkFilename: filename
    }
    const loaderOptions = {}

    // use relative publicPath in extracted CSS based on extract location
    const cssPublicPath = '../'.repeat(
        extractOptions.filename
            .replace(/^\.[\/\\]/, '')
            .split(/[\/\\]/g)
            .length - 1
      )

    const hasPostCSSConfig = !!(api.service.pkg.postcss || findExisting(api.resolve('.'), [
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

    const needInlineMinification = isProd && !shouldExtract
    const cssnanoOptions = {
      preset: ['default', {
        mergeLonghand: false,
        cssDeclarationSorter: false
      }]
    }
    if (sourceMap) {
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
          .options({
            sourceMap,
            importLoaders: (
              (needInlineMinification ? 1 : 0) +  // cssnano minification
              1 + // postcss-loader
              (loader ? 1 : 0) // other loader
            )
          })

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
    createCSSRule('less', /\.less$/, 'less-loader')
    createCSSRule('scss', /\.scss$/, 'sass-loader', { implementation: require('sass') })
    createCSSRule('sass', /\.sass$/, 'sass-loader', { implementation: require('sass'), sassOptions: { indentedSyntax: true } })
    createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', { preferPathResolver: 'webpack'})
    createCSSRule('postcss', /\.p(ost)?css$/)

    if (shouldExtract) {
      chainWebpack
        .plugin('extract-css')
          .use(require('mini-css-extract-plugin'), [extractOptions])

      if (isProd) {
        chainWebpack
          .plugin('optimize-css')
            .use(require('@intervolga/optimize-cssnano-plugin'), [{
              sourceMap,
              cssnanoOptions
            }])
      }
    }
  })
}
