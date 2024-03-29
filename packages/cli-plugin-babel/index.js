const path = require('path')
const babel = require('@babel/core')
const { isWindows, os, resolveEntryIndex } = require('@etherfe/cli-utils')

function genTranspileDepRegex (transpileDependencies) {
  if (!Array.isArray(transpileDependencies)) return
  const deps = transpileDependencies.map(dep => {
    if (typeof dep === 'string') {
      const depPath = path.join('node_modules', dep, '/')
      return isWindows
        ? depPath.replace(/\\/g, '\\\\')
        : depPath
    } else if (dep instanceof RegExp) {
      return dep.source
    }
  })
  return deps.length ? new RegExp(deps.join('|')) : null
}

module.exports = (api, options, pluginConfig) => {
  const useThreads = process.env.NODE_ENV === 'production' && !!pluginConfig.parallel
  const transpileDepRegex = genTranspileDepRegex(pluginConfig.transpileDependencies)

  const entryIndexPath = resolveEntryIndex(api.getCwd())
  babel.loadPartialConfigSync({ filename: entryIndexPath })
  
  api.chainWebpack(chainWebpack => {
    chainWebpack.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'))
    
    chainWebpack.module
      .rule('js')
      .resolve
        .set('fullySpecified', false)

    const jsRule = chainWebpack.module
      .rule('js')
        .test(/\.(m|c)?jsx?$/)
        .exclude
          .add(filepath => {
            if (!filepath) {
              return true
            }

            if (/\.vue\.jsx?$/.test(filepath)) {
              return false
            }

            if (filepath.startsWith(path.dirname(require.resolve('@etherfe/cli-service')) + '/')) {
              return true
            }

            if (transpileDepRegex && transpileDepRegex.test(filepath)) {
              return false
            }

            return /node_modules/.test(filepath)
          })
          .end()
        .use('cache-loader')
          .loader(require.resolve('cache-loader'))
          .options(api.genCacheConfig('babel-loader', {
            '@babel/core': require('@babel/core/package.json').version,
            'babel-loader': require('babel-loader/package.json').version,
            browserslist: api.service.pkg.browserslist
          }, [
            'babel.config.js',
            '.browserslistrc',
            path.join(__dirname, 'babel.config.js')
          ]))
          .end()

    if (useThreads) {
      const threadLoaderConfig = jsRule
        .use('thread-loader')
          .loader(require.resolve('thread-loader'))

      const cpus = os.cpus()
      if(cpus && cpus.length > 1) {
        threadLoaderConfig.options({ workers: cpus.length })
      }
    }

    jsRule
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options({
          cacheCompression: false,
          cacheDirectory: false,
          compact: false,
          extends: path.join(__dirname, './babel.config.js'),
          presets: [],
          plugins: []
        })
  })

}

module.exports.defaultConfig = {
  // deps to transpile
  transpileDependencies: [
    /* string or regex */
  ],
  parallel: undefined
}
