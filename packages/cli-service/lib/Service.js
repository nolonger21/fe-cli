const { merge } = require('webpack-merge')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')
const defaultsDeep = require('lodash.defaultsdeep')
const {
  minimist, chalk, warn, error, resolveEnvFiles,
  loadPlugins, loadPkgPlugins, loadLocalPlugins,
  resolvePkg, ensureSlash, removeSlash, fixPathPrefix, resolveConfig,
  checkTsProjectRun
} = require('@etherfe/cli-utils')
const path = require('path')
const { defaults } = require('./util/defaultConfig')
const serve = require('./commands/serve')

let service = null;

const initService = (context = process.cwd()) => {
  const pkg = resolvePkg(context)
  const plugins = resolvePlugins(context, pkg)

  return {
    inited: false,
    context: context,
    pkg,
    servicePkg: require('../package.json'),
    pkgDepend: Object.assign({}, pkg.devDependencies || {}, pkg.dependencies || {}),
    projectConfig: resolveConfig(context, pkg),
    modes: resolvePluginModes(plugins),
    mode: '',
    plugins,
    commands: {},
    webpackChainFns: [],
    webpackRawFns: [],
    devServerConfigFns: [],
    runCheckFns: []
  }
}

module.exports = async () => {
  const rawArgv = process.argv.slice(2)
  const projectContext = process.cwd()

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
    service = initService(projectContext);
    Object.assign(service, {
      resolveChainableWebpackConfig,
      resolveWebpackConfig
    })
  }

  const mode = args.mode || service.modes[command]

  initPlugins(mode)

  checkTsProjectRun(service, args)

  if(['serve', 'build'].includes(command)) {
    runCheck(args, rawArgv)
  }

  return runCommand(command, args, rawArgv);
}
  
const initPlugins = (mode) => {
  if (service.inited) return
  service.inited = true
  
  service.mode = mode;
  const nodeRuningEnv = (mode === 'production' || mode === 'test') ? mode : 'development'
  process.env.NODE_ENV = nodeRuningEnv
  process.env.BABEL_ENV = nodeRuningEnv

  resolveEnvFiles(service.context, mode)

  const projectConfig = resolveProjectConfig(service.projectConfig, service.context)
  service.plugins.forEach(({ id, apply }) => {
    apply(new PluginAPI(id, service), projectConfig)
  })

  if (service.projectConfig) {
    service.webpackRawFns.push(service.projectConfig)
  }
  service.projectConfig = projectConfig
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

const resolvePlugins = (context, pkg) => {
  let plugins
  let builtInPlugins = loadPlugins([
    './commands/serve',
    './commands/build',
    './commands/inspect',
    './commands/help',

    './config/base',
    './config/assets',
    './config/css',
    './config/html',
  ], __dirname)

  const pkgPlugins = loadPkgPlugins(pkg)
  plugins = builtInPlugins.concat(pkgPlugins)

  const localPlugins = loadLocalPlugins(context)
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

const resolveProjectConfig = (fileConfig, context)  =>{
  if (typeof fileConfig === 'function') {
    fileConfig = fileConfig()
  }
  if (!fileConfig || typeof fileConfig !== 'object') {
    error(`Error loading ${chalk.bold(fileConfigPath)}: should export an object or a function that returns object.`)
    fileConfig = null
  }
  
  let resolved = fileConfig || {}

  if(typeof resolved.output === 'object') {
    ensureSlash(resolved.output, 'publicPath')
    fixPathPrefix(resolved.output, 'publicPath')
    removeSlash(resolved.output, 'path')
  }

  return defaultsDeep(resolved, defaults(context))
}

const resolveChainableWebpackConfig = () =>  {
  const chainableConfig = new Config()
  service.webpackChainFns.forEach(fn => fn(chainableConfig))
  return chainableConfig
}

const resolveWebpackConfig = (chainableConfig = service.resolveChainableWebpackConfig()) => {
  if (!service.inited) {
    throw new Error('Service must call init() before calling resolveWebpackConfig().')
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
