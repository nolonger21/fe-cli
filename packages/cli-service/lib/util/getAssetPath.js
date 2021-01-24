const path = require('path')

module.exports = function getAssetPath (assetsDir, filePath) {
  return assetsDir ? path.posix.join(
    assetsDir.replace(/^\/*/, "").replace(/^\.\//, "")
  , filePath) : filePath
}