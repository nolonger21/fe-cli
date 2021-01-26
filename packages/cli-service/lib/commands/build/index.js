
module.exports = (api, options, pluginConfig) => {
  api.registerCommand('build', 
  {
    description: 'build for production',
    usage: 'fe-cli-service build [options] [entry|pattern]',
    options: {
      '--mode': `specify env mode (default: production)`,
      '--entry': `specify entry file (default: src/main.js)`,
      '--dest': `specify output directory (default: ${options.output ? options.output.path : 'dist'})`,
      '--no-clean': `do not remove the dist directory before building the project`,
      '--no-mini': `turn off compression`,
      '--report': `generate report.html to help analyze bundle content`,
      '--report-json': 'generate report.json to help analyze bundle content'
    }
  }, async (args, rawArgs) => {
    const fs = require('fs-extra')
    const path = require('path')
    const webpack = require('webpack')
    const { chalk, log, done, error, info, logWithSpinner, stopSpinner } = require('@etherfe/cli-utils')
    const formatStats = require('./formatStats')
    const validateWebpackConfig = require('../../util/validateWebpackConfig')
    const getAssetPath = require('../../util/getAssetPath')
    const TerserPlugin = require('terser-webpack-plugin')

    args.entry = args.entry || args._[0]

    const mode = api.service.mode
    logWithSpinner(`Building for ${mode}...`)

    api.chainWebpack(chainWebpack => {
      if (process.env.NODE_ENV !== 'production') return 
      const outputAssetName = `${pluginConfig.filenameHashing ? '.[contenthash:8]' : ''}.js`
      const outPutFileName = getAssetPath(pluginConfig.assetsDir, `js/[name]${outputAssetName}`)
      chainWebpack
        .mode('production')
        .output
          .filename(outPutFileName)
          .chunkFilename(outPutFileName)

      chainWebpack
        .devtool(pluginConfig.productionSourceMap ? 'source-map' : false)

      const terserOptions = require('./terserOptions')
      chainWebpack.optimization
        .minimize(args.mini === null || args.mini === undefined)
        .minimizer('terser')
          .use(TerserPlugin, [terserOptions(pluginConfig)])

      chainWebpack.optimization
        .splitChunks({
          cacheGroups: {
            defaultVendors: {
              name: `chunk-vendors`,
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              chunks: 'initial'
            },
            common: {
              name: `chunk-common`,
              minChunks: 2,
              priority: -20,
              chunks: 'initial',
              reuseExistingChunk: true
            }
          }
        })
    })

    api.configureWebpack(webpackConfig => {
      return {
        optimization: {
          chunkIds: 'deterministic',
          moduleIds: 'deterministic'
        }
      }
    })

    const config = api.resolveChainableWebpackConfig()
    let webpackConfig = api.resolveWebpackConfig(config)

    let targetDir = webpackConfig.output.path;
    if (args.dest && typeof args.dest === 'string') {
      targetDir = args.dest
    }

    if (args.entry && Object.keys(webpackConfig.entry).length === 1) {
      webpackConfig.entry = { app: api.resolve(args.entry) }
    }

    targetDir = api.resolve(targetDir)
    if (args.dest && config.plugins.has('copy')) {
      config.plugin('copy').tap(pluginArgs => {
        pluginArgs[0][0].to = targetDir
        return pluginArgs
      })
    }

    webpackConfig = api.resolveWebpackConfig(config)
    webpackConfig.output.path = targetDir

    validateWebpackConfig(webpackConfig, api, options)

    if (args.report || args['report-json']) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      webpackConfig.plugins.push(new BundleAnalyzerPlugin({
        logLevel: 'warn',
        openAnalyzer: false,
        analyzerMode: args.report ? 'static' : 'disabled',
        reportFilename: `report.html`,
        statsFilename: `report.json`,
        generateStatsFile: !!args['report-json']
      }))
    }

    if (args.clean === null || args.clean === undefined) {
      await fs.remove(targetDir)
    }

    return new Promise((resolve, reject) => {
      if (args.lc) {
        console.info(webpackConfig) // latest webpack config
      }
      webpack(webpackConfig, (err, stats) => {
        stopSpinner(false)
        if (err) {
          return reject(err)
        }

        if (stats.hasErrors()) {
          // error(stats.compilation.errors)  // -> @soda/friendly-errors-webpack-plugin
          return reject(`Build failed with errors.`)
        }

        if (!args.silent) {
          const targetDirShort = path.relative(api.service.context, targetDir)
          log(formatStats(stats, targetDirShort, api))
          done(`Build complete. The ${chalk.cyan(targetDirShort)} directory is ready to be deployed.`)
        }

        resolve()
      })
    })
  })
}

module.exports.defaultModes = {
  build: 'production'
}
