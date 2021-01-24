
const path = require('path')

exports.defaultWebpackConfig = (context) => {
  const resolve = _path => path.resolve(context, _path)

  return {
    entry: {
    },
    output: {
      path: resolve('dist'),
      publicPath: '/',
    },
    module: {
      rules: []
    },
    plugins: []
  }
}

function hasMultipleCores () {
  try {
    return require('os').cpus().length > 1
  } catch (e) {
    return false
  }
}

exports.defaultFeConfig = (context) => ({

  // where to put static assets (js/css/img/font/...)
  assetsDir: '',

  // whether filename will contain hash part
  filenameHashing: true,

  // boolean, use full build?
  runtimeCompiler: false,

  // deps to transpile
  transpileDependencies: [
    /* string or regex */
  ],

  // sourceMap for production build?
  productionSourceMap: true,

  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  parallel: hasMultipleCores(),

  // <script type="module" crossorigin="use-credentials">
  crossorigin: undefined,

  // subresource integrity
  integrity: false,

  css: {
    // extract: true,
    // sourceMap: false,
    // loaderOptions: {}
  }
})
