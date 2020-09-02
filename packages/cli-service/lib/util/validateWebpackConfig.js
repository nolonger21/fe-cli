
module.exports = function validateWebpackConfig (webpackConfig, api, options) {

  const actualTargetDir = webpackConfig.output.path

  if (actualTargetDir === api.service.context) {
    throw new Error(
      `\n\nConfiguration Error: ` +
      `Do not set output directory to project root.\n`
    )
  }
}
