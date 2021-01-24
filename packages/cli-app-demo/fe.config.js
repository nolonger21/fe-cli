
module.exports = ({ feConfig, chainWebpack } = {}) => {
  feConfig((feConfig) => {
    console.log(feConfig)
  })

  chainWebpack((chainWebpack) => {
  })
}
