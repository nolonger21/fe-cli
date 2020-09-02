const path = require('path')
const resolve = (_path) => path.resolve(__dirname, _path)

module.exports = (config) => {
  // console.info(config, 'fe.config.js')
  return {
    entry: {
      app: './src/index.js'
    }
  } 
}
