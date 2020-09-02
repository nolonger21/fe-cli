const path = require('path')

module.exports = function getAssetPath (options, filePath) {
  return options.assetDir
    ? path.posix.join(options.assetDir, filePath)
    : filePath
}
