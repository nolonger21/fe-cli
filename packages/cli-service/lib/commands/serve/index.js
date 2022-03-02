const {
  info,
  error,
  hasProjectYarn,
  hasProjectPnpm,
  openBrowser,
  checkInContainer
} = require('@etherfe/cli-utils')

const defaults = {
  host: '0.0.0.0',
  port: 8080,
  https: false
}

module.exports = (api, options, pluginConfig) => {
  api.registerCommand('serve', {
    description: 'start development server',
    usage: 'fe-cli-service serve [options] [entry]',
    options: {
      '--mode': `specify env mode (default: development)`,
      '--open': `open browser on server start`,
      '--copy': `copy url to clipboard on server start`,
      '--host': `specify host (default: ${defaults.host})`,
      '--port': `specify port (default: ${defaults.port})`,
      '--https': `use https (default: ${defaults.https})`,
      '--public': `specify the public network URL for the HMR client`
    }
  }, async function serve (args) {
    info('Starting development server...')

    const isInContainer = checkInContainer()
    const isProduction = process.env.NODE_ENV === 'production'

    const { chalk, isAbsoluteUrl } = require('@etherfe/cli-utils')
    const webpack = require('webpack')
    const WebpackDevServer = require('webpack-dev-server')
    const portfinder = require('portfinder')
    const prepareURLs = require('./prepareURLs')
    const prepareProxy = require('./prepareProxy')
    const validateWebpackConfig = require('../../util/validateWebpackConfig')
    const getAssetPath = require('../../util/getAssetPath')

    api.chainWebpack(chainWebpack => {
      if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {

        const outPutFileName = getAssetPath(pluginConfig.assetsDir, `js/[name].[fullhash:8].js`)
        chainWebpack
          .mode('development')
          .output
            .filename(outPutFileName)
            .chunkFilename(outPutFileName)
            
        chainWebpack
          .devtool('cheap-module-source-map')

        chainWebpack.stats('none') // replace webpack-dev-server 5  clientLogLevel
      }
    })

    const webpackConfig = api.resolveWebpackConfig()
    const entryPages = webpackConfig.entry || {}
    const outPublicPath = webpackConfig.output.publicPath || '/'
    validateWebpackConfig(webpackConfig, api, options)

    const projectDevServerOptions = webpackConfig.devServer || {}
    const useHttps = args.https || projectDevServerOptions.https || defaults.https
    const protocol = useHttps ? 'https' : 'http'
    const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host
    portfinder.basePort = args.port || process.env.PORT || projectDevServerOptions.port || defaults.port
    const port = await portfinder.getPortPromise()
    const rawPublicUrl = args.public || projectDevServerOptions.public
    const publicUrl = rawPublicUrl
      ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
        ? rawPublicUrl
        : `${protocol}://${rawPublicUrl}`
      : null
    const publicHost = publicUrl ? /^[a-zA-Z]+:\/\/([^/?#]+)/.exec(publicUrl)[1] : undefined

    const urls = prepareURLs(
      protocol,
      host,
      port,
      isAbsoluteUrl(outPublicPath) ? '/' : outPublicPath
    )
    const localUrlForBrowser = publicUrl || urls.localUrlForBrowser

    const proxySettings = prepareProxy(projectDevServerOptions.proxy, api.resolve('public'))
    const sockPathMap = {
      sockjs: '/sockjs-node', // support ie 11
      ws: '/ws'
    }

    let webSocketURL
    if (!isProduction) {
      if (publicHost) {
        webSocketURL = {
          protocol: protocol === 'https' ? 'wss' : 'ws',
          hostname: publicHost,
          port
        }
      } else if (isInContainer) {
        webSocketURL = 'auto://0.0.0.0:0/ws'
      } else {
        webSocketURL = {
          protocol: protocol === 'https' ? 'wss' : 'ws',
          hostname: urls.lanUrlForConfig || 'localhost',
          port
        }
      }

      if (process.env.APPVEYOR) {
        webpackConfig.plugins.push(
          new webpack.EntryPlugin(__dirname, 'webpack/hot/poll?500', { name: undefined })
        )
      }
    }

    const sockType = pluginConfig.sockType || 'ws' // sockjs

    if (args.lc) {
      console.info(webpackConfig) // latest webpack config
    }
    const compiler = webpack(webpackConfig)

    compiler.hooks.failed.tap('fe-cli-service serve', msg => {
      error(msg)
      compiler.close(() => {
        process.exit(1)
      })
    })

    const server = new WebpackDevServer(Object.assign({
      hot: !isProduction,
      liveReload: !isProduction,
      compress: isProduction,
      webSocketServer: sockType,
    }, projectDevServerOptions, {
      open: false, // custom open
      host,
      port,
      https: useHttps,
      proxy: proxySettings,
      static: {
        directory: api.resolve('public'),
        publicPath: outPublicPath,
        watch: !isProduction,
        ...projectDevServerOptions.static
      },
      client: {
        webSocketURL,
        logging: 'none',
        overlay: isProduction ? false : { warnings: false, errors: true },
        progress: !isProduction,
        webSocketTransport: sockType,
        ...projectDevServerOptions.client
      },
      historyApiFallback: {
        disableDotRule: true,
        htmlAcceptHeaders: [
          'text/html',
          'application/xhtml+xml'
        ],
        rewrites: genHistoryApiFallbackRewrites(outPublicPath, entryPages),
        ...projectDevServerOptions.historyApiFallback
      },
      setupExitSignals: true,
      setupMiddlewares (middlewares, devServer) {
        api.service.devServerConfigFns.forEach(fn => fn(devServer.app, devServer))
        if (projectDevServerOptions.setupMiddlewares) {
          return projectDevServerOptions.setupMiddlewares(middlewares, devServer)
        }
        return middlewares
      },
    }), compiler);

    return new Promise((resolve, reject) => {
      let isFirstCompile = true

      compiler.hooks.done.tap('fe-cli-service serve', stats => {
        if (stats.hasErrors()) {
          // error(stats.compilation.errors)  // -> @soda/friendly-errors-webpack-plugin
          return
        }

        let copied = ''
        if (isFirstCompile && args.copy) {
          try {
            require('clipboardy').writeSync(localUrlForBrowser)
            copied = chalk.dim('(copied to clipboard)')
          } catch (_) {
            // catch exception if copy to clipboard isn't supported
          }
        }

        const networkUrl = publicUrl
          ? publicUrl.replace(/([^/])$/, '$1/')
          : urls.lanUrlForTerminal

        console.log()
        console.log(`  App running at:`)
        console.log(`  - Local:   ${chalk.cyan(urls.localUrlForTerminal)} ${copied}`)
        if (!isInContainer) {
          console.log(`  - Network: ${chalk.cyan(networkUrl)}`)
        } else {
          console.log()
          console.log(chalk.yellow(`  It seems you are running Fe CLI inside a container.`))
          if (!publicUrl && outPublicPath && outPublicPath !== '/') {
            console.log()
            console.log(chalk.yellow(`  Since you are using a non-root publicPath, the hot-reload socket`))
            console.log(chalk.yellow(`  will not be able to infer the correct URL to connect. You should`))
            console.log(chalk.yellow(`  explicitly specify the URL via ${chalk.blue(`devServer.public`)}.`))
            console.log()
          }
          console.log(chalk.yellow(`  Access the dev server via ${chalk.cyan(
            `${protocol}://localhost:<your container's external mapped port>${outPublicPath}`
          )}`))
        }
        console.log()

        if (isFirstCompile) {
          isFirstCompile = false

          if (!isProduction) {
            const buildCommand = hasProjectYarn(api.getCwd()) ? `yarn build` : hasProjectPnpm(api.getCwd()) ? `pnpm run build` : `npm run build`
            console.log(`  Note that the development build is not optimized.`)
            console.log(`  To create a production build, run ${chalk.cyan(buildCommand)}.`)
          } else {
            console.log(`  App is served in production mode.`)
            console.log(`  Note this is for preview or E2E testing only.`)
          }
          console.log()

          if (args.open || projectDevServerOptions.open) {
            const pageUri = (projectDevServerOptions.openPage && typeof projectDevServerOptions.openPage === 'string')
              ? projectDevServerOptions.openPage
              : ''
            const isHttp = pageUri.startsWith('http')
            if (isHttp) {
              openBrowser(pageUri)
            } else {
              openBrowser(localUrlForBrowser + pageUri)
            }
          }

          resolve({
            server,
            url: localUrlForBrowser
          })
        }
      })

      server.start().catch(err => reject(err))
    })
  })
}

function genHistoryApiFallbackRewrites (baseUrl, pages = {}) {
  const path = require('path')
  const multiPageRewrites = Object
    .keys(pages)
    .sort((a, b) => b.length - a.length)
    .map(name => ({
      from: new RegExp(`^/${name}`),
      to: path.posix.join(baseUrl, pages[name].filename || `${name}.html`)
    }))
  return [
    ...multiPageRewrites,
    { from: /./, to: path.posix.join(baseUrl, 'index.html') }
  ]
}

module.exports.defaultModes = {
  serve: 'development'
}

module.exports.defaultConfig = {
  assetsDir: '',
  sockType: 'ws'
}
