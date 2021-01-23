const path = require('path')
const hash = require('hash-sum')
const { semver, matchesPluginId } = require('@etherfe/cli-utils')

class PluginAPI {
  constructor (id, service) {
    this.id = id
    this.service = service
  }

  get version () {
    return require('../package.json').version
  }

  assertVersion (range) {
    if (typeof range === 'number') {
      if (!Number.isInteger(range)) {
        throw new Error('Expected string or integer value.')
      }
      range = `^${range}.0.0-0`
    }
    if (typeof range !== 'string') {
      throw new Error('Expected string or integer value.')
    }

    if (semver.satisfies(this.version, range, { includePrerelease: true })) return

    throw new Error(
      `Require @etherfe/cli-service "${range}", but was loaded with "${this.version}".`
    )
  }

  getCwd () {
    return this.service.context
  }

  resolve (_path) {
    return path.resolve(this.service.context, _path)
  }

  hasPlugin (id) {
    return this.service.plugins.some(p => matchesPluginId(id, p.id))
  }

  hasDepend (pkgName) {
    return this.service.pkgDepend[pkgName];
  }

  registerCommand (name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = null
    }
    this.service.commands[name] = { fn, opts: opts || {}}
  }

  chainWebpack (fn) {
    this.service.webpackChainFns.push(fn)
  }

  configureWebpack (fn) {
    this.service.webpackRawFns.push(fn)
  }

  configureDevServer (fn) {
    this.service.devServerConfigFns.push(fn)
  }

  addRunCheck (fn) {
    this.service.runCheckFns.push(fn)
  }

  resolveWebpackConfig (chainableConfig) {
    return this.service.resolveWebpackConfig(chainableConfig)
  }

  resolveChainableWebpackConfig () {
    return this.service.resolveChainableWebpackConfig()
  }

  genCacheConfig (id, partialIdentifier, configFiles = []) {
    const fs = require('fs')
    const cacheDirectory = this.resolve(`node_modules/.cache/${id}`)

    const fmtFunc = conf => {
      if (typeof conf === 'function') {
        return conf.toString().replace(/\r\n?/g, '\n')
      }
      return conf
    }

    const variables = {
      partialIdentifier,
      'cli-service': require('../package.json').version,
      'cache-loader': require('cache-loader/package.json').version,
      env: process.env.NODE_ENV,
      config: [
        fmtFunc(this.service.webpackConfig),
        fmtFunc(this.service.projectConfig)
      ]
    }

    if (!Array.isArray(configFiles)) {
      configFiles = [configFiles]
    }
    configFiles = configFiles.concat([
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml'
    ])

    const readConfig = file => {
      const absolutePath = this.resolve(file)
      if (!fs.existsSync(absolutePath)) {
        return
      }

      if (absolutePath.endsWith('.js')) {
        try {
          return JSON.stringify(require(absolutePath))
        } catch (e) {
          return fs.readFileSync(absolutePath, 'utf-8')
        }
      } else {
        return fs.readFileSync(absolutePath, 'utf-8')
      }
    }

    variables.configFiles = configFiles.map(file => {
      const content = readConfig(file)
      return content && content.replace(/\r\n?/g, '\n')
    })

    const cacheIdentifier = hash(variables)
    return { cacheDirectory, cacheIdentifier }
  }
}

module.exports = PluginAPI
