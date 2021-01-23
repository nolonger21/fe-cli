const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { error } = require('./logger')
const { loadModule } = require('./module')

exports.resolveConfig = ({paths, context, isEsm} = {}) => {
  let fileConfig
  const possibleConfigPaths = paths || []
  let fileConfigPath
  for (const _path of possibleConfigPaths) {
    const resolvedPath = _path && path.resolve(context, _path)
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      fileConfigPath = resolvedPath
      break
    }
  }
  if (fileConfigPath) {
    if (isEsm && fileConfigPath.endsWith('.js')) {
      throw new Error(`Please rename ${chalk.bold('.js')} to ${chalk.bold('.cjs')} when ECMAScript modules is enabled`)
    }

    try {
      fileConfig = loadModule(fileConfigPath, context)
    } catch (e) {
      error(`Error load ${chalk.bold(fileConfigPath)}:`)
      throw e
    }
  }
  if (fileConfig && typeof fileConfig !== 'object' && typeof fileConfig !== 'function') {
    error(`Error load ${chalk.bold(fileConfigPath)}: should export an object or a function that returns object.`)
    fileConfig = null
  }
  return fileConfig;
}
