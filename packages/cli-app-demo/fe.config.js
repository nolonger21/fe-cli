
module.exports = ({ feConfig, chainWebpack } = {}) => {

  feConfig((feConfig) => {
    // console.log(feConfig)
  })

  chainWebpack((chainWebpack) => {
  })
}

module.exports.skipPlugins = [
  // 'local:fe-cli-plugin-test'
]