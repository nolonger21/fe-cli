const fs = require('fs')
const path = require('path')

// ensure the filename passed to html-webpack-plugin is a relative path
// because it cannot correctly handle absolute paths
function ensureRelative (outputDir, _path) {
  if (path.isAbsolute(_path)) {
    return path.relative(outputDir, _path)
  } else {
    return _path
  }
}

module.exports = (api, options, pluginConfig) => {

  api.chainWebpack(chainWebpack => {
    const isProd = process.env.NODE_ENV === 'production'
    const outputDir = api.resolve(options.output.path)
    const publicPath = api.resolve(options.output.publicPath)

    // HTML plugin
    const { resolveClientEnv } = require('@etherfe/cli-utils')

    const chunkSorters = require('html-webpack-plugin/lib/chunksorter')
    const depSort = chunkSorters.dependency
    chunkSorters.auto = chunkSorters.dependency = (chunks, ...args) => {
      try {
        return depSort(chunks, ...args)
      } catch (e) {
        // fallback to a manual sort if that happens...
        return chunks.sort((a, b) => {
          // make sure user entry is loaded last so user CSS can override
          // vendor CSS
          if (a.id === 'app') {
            return 1
          } else if (b.id === 'app') {
            return -1
          } else if (a.entry !== b.entry) {
            return b.entry ? -1 : 1
          }
          return 0
        })
      }
    }

    const htmlOptions = {
      title: api.service.pkg.name,
      templateParameters: (compilation, assets, pluginOptions) => {
        // enhance html-webpack-plugin's built in template params
        let stats
        return Object.assign({
          // make stats lazy as it is expensive
          get webpack () {
            return stats || (stats = compilation.getStats().toJson())
          },
          compilation: compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: pluginOptions
          }
        },
        resolveClientEnv(/^APP_/, {
            BASE_URL: publicPath
          }, true /* raw */)
        )
      }
    }
  
    if (isProd) {
      Object.assign(htmlOptions, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          collapseBooleanAttributes: true,
          removeScriptTypeAttributes: true
        }
      })
    }

    // resolve HTML file(s)
    const HTMLPlugin = require('html-webpack-plugin')
    const PreloadPlugin = require('@vue/preload-webpack-plugin')
    const isMultiPage = Object.keys(options.entry).length > 1
    const multiPageConfig = isMultiPage ? options.entry : null
    const htmlPath = api.resolve('public/index.html')
    const defaultHtmlPath = path.resolve(__dirname, 'index.html')
    const publicCopyIgnore = ['.DS_Store']

    if (!multiPageConfig) {
      // default, single page setup.
      htmlOptions.template = fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath
      publicCopyIgnore.push(path.relative(api.resolve('public'), api.resolve(htmlOptions.template)))

      chainWebpack
        .plugin('html')
          .use(HTMLPlugin, [htmlOptions])

      // inject preload/prefetch to HTML
      chainWebpack
        .plugin('preload')
          .use(PreloadPlugin, [{
            rel: 'preload',
            include: 'initial',
            fileBlacklist: [/\.map$/, /hot-update\.js$/]
          }])

      chainWebpack
        .plugin('prefetch')
          .use(PreloadPlugin, [{
            rel: 'prefetch',
            include: 'asyncChunks'
          }])
    } else {
      // multi-page setup
      const pages = Object.keys(multiPageConfig)
      const normalizePageConfig = c => {
        if(typeof c === 'string' || Array.isArray(c)) {
          return { entry: c }
        }
        return c
      }

      pages.forEach(name => {
        const pageConfig = normalizePageConfig(multiPageConfig[name])
        const {
          entry,
          template = `public/${name}.html`,
          filename = `${name}.html`,
          chunks = ['chunk-vendors', 'chunk-common', name]
        } = pageConfig

        // So here we have to extract the customHtmlOptions manually.
        const customHtmlOptions = {}
        for (const key in pageConfig) {
          if (
            !['entry', 'template', 'filename', 'chunks'].includes(key)
          ) {
            customHtmlOptions[key] = pageConfig[key]
          }
        }

        // inject entry
        const entries = Array.isArray(entry) ? entry : [entry]
        chainWebpack.entry(name).merge(entries.map(e => api.resolve(e)))

        // resolve page index template
        const hasDedicatedTemplate = fs.existsSync(api.resolve(template))
        const templatePath = hasDedicatedTemplate
          ? template
          : fs.existsSync(htmlPath)
            ? htmlPath
            : defaultHtmlPath

        publicCopyIgnore.push(path.relative(api.resolve('public'), api.resolve(templatePath)))

        // inject html plugin for the page
        const pageHtmlOptions = Object.assign(
          {},
          htmlOptions,
          {
            chunks,
            template: templatePath,
            filename: ensureRelative(outputDir, filename)
          },
          customHtmlOptions
        )

        chainWebpack
          .plugin(`html-${name}`)
            .use(HTMLPlugin, [pageHtmlOptions])

        // preload/prefetch
        const includeFilename = ensureRelative(
          outputDir,
          normalizePageConfig(multiPageConfig[name]).filename || `${name}.html`
        )

        chainWebpack
          .plugin(`preload-${name}`)
            .use(PreloadPlugin, [{
              rel: 'preload',
              includeHtmlNames: [includeFilename],
              include: 'initial',
              fileBlacklist: [/\.map$/, /hot-update\.js$/]
            }])

        chainWebpack
          .plugin(`prefetch-${name}`)
            .use(PreloadPlugin, [{
              rel: 'prefetch',
              includeHtmlNames: [includeFilename],
              include: 'asyncChunks'
            }])
      })
    }

    // CORS and Subresource Integrity
    if (pluginConfig.crossorigin != null || pluginConfig.integrity) {
      chainWebpack
        .plugin('cors')
          .use(require('../webpack/CorsPlugin'), [{
            crossorigin: pluginConfig.crossorigin,
            integrity: pluginConfig.integrity,
            publicPath
          }])
    }
  
    // copy static assets in public/
    const publicDir = api.resolve('public')
    if (fs.existsSync(publicDir) && fs.readdirSync(publicDir).length) {
      chainWebpack
        .plugin('copy')
          .use(require('copy-webpack-plugin'), [{
            patterns: [
              {
                from: publicDir, 
                to: outputDir,
                toType: 'dir',
                globOptions: {
                  ignore: publicCopyIgnore
                },
              },
            ]
          }
        ])
    }
  })
}

module.exports.defaultConfig = {
  // <script type="module" crossorigin="use-credentials">
  crossorigin: undefined,

  // subresource integrity
  integrity: false,
}