
const path = require('path')

exports.defaults = (context) => {
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