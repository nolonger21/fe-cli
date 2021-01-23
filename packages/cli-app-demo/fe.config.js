
module.exports = ({ config, chainWebpack } = {}) => {
  config({
    global: {
      inlineLimit: 4028
    },
    'built-in:config/assets': {
      inlineLimit: 2000
    }
  })

  chainWebpack((chainWebpack) => {
  })

  return {
    entry: {
      app: './src/index.js'
    }
  }
}
