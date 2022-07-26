const { merge } = require('webpack-merge')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')
const defaultsDeep = require('lodash.defaultsdeep')
const mergeDeep = require('lodash.merge')
const {
  minimist, chalk, warn, error, resolveEnvFiles,
  loadPlugins, loadPkgPlugins, loadLocalPlugins, resolvePluginId,
  resolvePkg, ensureSlash, removeSlash, fixPathPrefix, resolveConfig,
  checkTsProjectRun
} = require('@etherfe/cli-utils')
const { defaultWebpackConfig, defaultFeConfig } = require('./util/defaultConfig')
const { deepCompareDifference } = require('./util/common')

let service = null;


const setPluginsToSkip = (args, webpackConfig) => {
  let _skipPlugins = args['skip-plugins']
  _skipPlugins = _skipPlugins ? _skipPlugins.split(',') : []
  if (typeof webpackConfig === 'function') {
    const { skipPlugins = [] } = webpackConfig || {} 
    if(Array.isArray(skipPlugins)) {
      _skipPlugins = skipPlugins.concat(_skipPlugins)
    }
  }
  const pluginsToSkip = new Set(_skipPlugins.map(id => resolvePluginId(id, true)))

  return pluginsToSkip
}

const initService = (context, args) => {
  const pkg = resolvePkg(context)
  const webpackConfig = resolveConfig({
    paths: [
      './fe.config.js',
      './config/fe.config.js',
      './webpack.config.js',
      './config/webpack.config.js'
    ], 
    context, 
    esm: pkg.type === 'module'
  })
  // --skip-plugins arg may have plugins that should be skipped during init()
  const pluginsToSkip = setPluginsToSkip(args, webpackConfig)
  const plugins = resolvePlugins(context, pkg, pluginsToSkip)
  const modes = resolvePluginModes(plugins)

  return {
    inited: false,
    context,
    pkg,
    servicePkg: require('../package.json'),
    pkgDepend: Object.assign({}, pkg.devDependencies || {}, pkg.dependencies || {}),
    webpackConfig,
    feConfig: defaultFeConfig(context),
    modes,
    mode: '',
    plugins,
    pluginsToSkip,
    commands: {},
    webpackChainFns: [],
    webpackRawFns: [],
    devServerConfigFns: [],
    runCheckFns: [],
    chainWebpackCallback: null
  }
}

module.exports = async () => {
  const context = process.cwd()
  const rawArgv = process.argv.slice(2)
  const args = minimist(rawArgv, {
    boolean: [
      // build
      'report',
      // serve
      'open',
      'https',
      // other
      'verbose'
    ]
  })
  const command = args._[0]

  if(service) {
    service = service
  } else {
    // load resource and ready service
    service = initService(context, args);
    Object.assign(service, {
      resolveChainableWebpackConfig,
      resolveWebpackConfig
    })
  }

  const mode = args.mode || service.modes[command]

  readyEnv(mode)
  initPlugins()
  checkTsProjectRun(service, args)

  if(['serve', 'build'].includes(command)) {
    runCheck(args, rawArgv)
  }

  return runCommand(command, args, rawArgv);
}

const readyEnv = (mode) => {
  service.mode = mode;
  const nodeRuningEnv = (mode === 'production' || mode === 'test') ? mode : 'development'
  process.env.NODE_ENV = nodeRuningEnv
  process.env.BABEL_ENV = nodeRuningEnv
  resolveEnvFiles(service.context, mode)
}
  
const initPlugins = () => {
  if (service.inited) return
  service.inited = true
  service.plugins.forEach(({ id, apply }) => {
    const { defaultConfig } = apply || {};
    if (Object.prototype.toString.call(defaultConfig) === '[object Object]') {
      service.feConfig[id] = defaultConfig
    }
  })
  service.webpackConfig = resolveProjectWebpackConfig(service.webpackConfig, service.context)
  service.plugins.forEach(({ id, apply }) => {
    const { defaultConfig = {} } = apply || {};
    const pluginConfig = Object.prototype.toString.call(service.feConfig) === '[object Object]' ? service.feConfig[id] || {} : {}
    const diffData = deepCompareDifference(defaultConfig, pluginConfig)
    const pluginConfigMerge = mergeDeep(pluginConfig, service.feConfig['global'], diffData)
    apply(new PluginAPI(id, service), service.webpackConfig, pluginConfigMerge)
  })
  service.webpackRawFns.push(service.webpackConfig)
}

const runCheck = (args, rawArgv) => {
  service.runCheckFns.forEach((fn) => {
    fn(args, rawArgv)
  })
}

const runCommand = (command, args = {}, rawArgv = []) => {
  args._ = args._ || []
  let commandItem = service.commands[command]
  if (!commandItem && command) {
    error(`command "${command}" does not exist.`)
    process.exit(1)
  }
  if (!commandItem || args.help || args.h) {
    commandItem = service.commands.help
  } else {
    args._.shift()
    rawArgv.shift()
  }
  return commandItem.fn(args, rawArgv)
}

const resolvePlugins = (context, pkg, pluginsToSkip) => {
  let plugins

  const skipPluginCallback = (id) => {
    return !pluginsToSkip.has(id)
  }

  let builtInPlugins = loadPlugins([
    './config/base',
    './config/assets',
    './config/css',
    './config/html',

    './commands/serve',
    './commands/build',
    './commands/inspect',
    './commands/help',
  ], __dirname, skipPluginCallback)

  const pkgPlugins = loadPkgPlugins(pkg, skipPluginCallback)
  plugins = builtInPlugins.concat(pkgPlugins)

  const localPlugins = loadLocalPlugins(context,skipPluginCallback)
  plugins = plugins.concat(localPlugins)

  return plugins
}


const resolvePluginModes = (plugins) => {
  let modes = {}
  Array.isArray(plugins) && plugins.forEach(item => {
    const { apply: { defaultModes }} = item || {};
    Object.assign(modes,defaultModes);
  });
  return modes;
}

const resolveFeConfig = (feConfig) => {
  if (!feConfig) return

  if (typeof feConfig === 'function') {
    feConfig = feConfig(service.feConfig)
  }
  
  if (Object.prototype.toString.call(feConfig) === '[object Object]') {
    service.feConfig = defaultsDeep(feConfig, service.feConfig)
  }
}

const resolveChainWebpackCallback = (chainWebpackCallback) => {
  if (typeof chainWebpackCallback === 'function') {
    service.chainWebpackCallback = chainWebpackCallback
  }
}

const resolveProjectWebpackConfig = (fileConfig, context) => {
  if (typeof fileConfig === 'function') {
    fileConfig = fileConfig({
      feConfig: resolveFeConfig,
      chainWebpack: resolveChainWebpackCallback
    })
  }
  
  let resolved = fileConfig || {}

  if (Object.prototype.toString.call(resolved.output) === '[object Object]') {
    ensureSlash(resolved.output, 'publicPath')
    fixPathPrefix(resolved.output, 'publicPath')
    removeSlash(resolved.output, 'path')
  }

  return defaultsDeep(resolved, defaultWebpackConfig(context))
}

/** Executed last during development or build **/

// Merge all the Chainable Webpack Config of the plug-in
const resolveChainableWebpackConfig = () =>  {
  const chainableConfig = new Config()
  service.webpackChainFns.forEach(fn => fn(chainableConfig))
  return chainableConfig
}

// Merge all the Webpack Config of the plug-in
const resolveWebpackConfig = (chainableConfig = service.resolveChainableWebpackConfig()) => {
  if (!service.inited) {
    throw new Error('Service must call init() before calling resolveWebpackConfig().')
  }
  if (typeof service.chainWebpackCallback === 'function') {
    service.chainWebpackCallback(chainableConfig)
  }
  let config = chainableConfig.toConfig()
  const original = config
  service.webpackRawFns.forEach(fn => {
    if (typeof fn === 'function') {
      const res = fn(config)
      if (res) config = merge(config, res)
    } else if (fn) {
      config = merge(config, fn)
    }
  })
  

  if (config !== original) {
    cloneRuleNames(
      config.module && config.module.rules,
      original.module && original.module.rules
    )
  }

  return config
}


const cloneRuleNames = (to, from) => {
  if (!to || !from) {
    return
  }
  from.forEach((r, i) => {
    if (to[i]) {
      Object.defineProperty(to[i], '__ruleNames', {
        value: r.__ruleNames
      })
      cloneRuleNames(to[i].oneOf, r.oneOf)
    }
  })
}
