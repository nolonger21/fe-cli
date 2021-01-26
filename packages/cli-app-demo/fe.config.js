
module.exports = ({ feConfig, chainWebpack } = {}) => {
  // plugin configuration items
  feConfig((feConfig) => {
    // Prints configurable items for the current plug-in
    // console.log(feConfig)
  })

  // modify plug-ins
  chainWebpack((chainWebpack) => {
  })

  return {
    // webpack
  }
}

module.exports.skipPlugins = [
  // 'local:fe-cli-plugin-test'
]