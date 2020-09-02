const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { error } = require('./logger')
const { loadModule } = require('./module')

exports.resolveConfig = (context, pkg) => {
  const isEsm = pkg.type && pkg.type === 'module'
  let fileConfig
  const possibleConfigPaths = [
    './fe.config.js',
    './fe.config.cjs',
    './config/fe.config.js',
    './config/fe.config.cjs'
  ]
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
      throw new Error(`Please rename ${chalk.bold('fe.config.js')} to ${chalk.bold('fe.config.cjs')} when ECMAScript modules is enabled`)
    }

    try {
      fileConfig = loadModule(fileConfigPath, context)
    } catch (e) {
      error(`Error loading ${chalk.bold(fileConfigPath)}:`)
      throw e
    }
  }
  return fileConfig;
}
