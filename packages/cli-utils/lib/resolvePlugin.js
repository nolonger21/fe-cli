const path = require('path')

const pluginRE = /^(@(etherfe|vue)\/|(vue|fe)-|@[\w-]+(\.)?[\w-]+\/(vue|fe)-)cli-plugin-/
// @etherfe/cli-plugin-foo, fe-cli-plugin-foo, @bar/fe-cli-plugin-foo
// @vue/cli-plugin-foo, vue-cli-plugin-foo, @bar/vue-cli-plugin-foo

const officialRE = /^@(etherfe|vue)\//
// @etherfe/cli-plugin-foo @etherfe/cli
// @vue/cli-plugin-foo @vue/cli

exports.isPlugin = id => pluginRE.test(id)

exports.isOfficialPlugin = id => exports.isPlugin(id) && officialRE.test(id)

exports.joinOfficialPluginName = id => `@etherfe/cli-plugin-${id}`

exports.toShortPluginId = id => id.replace(pluginRE, '')

exports.resolvePluginId = id => {
  if (pluginRE.test(id)) return id
  return `fe-cli-plugin-${id}`
}

exports.matchesPluginId = (input, full) => {
  const short = full.replace(pluginRE, '')
  return ( full === input || short === input);
}

exports.loadPlugin = (id, context) => {
  let targetPath = '';
  if (context) {
    targetPath = path.join(context, id)
  }
  return {
    id: id.replace(/^.\//, 'built-in:').replace(/^\//, 'local:'),
    apply: require(targetPath || id)
  }
}

exports.loadPlugins = (pluginPaths = [], context) => {
  return pluginPaths.map(path => exports.loadPlugin(path, context))
}

exports.loadPkgPlugins = (pkg = {}) => {
  const projectPlugins = Object.keys(pkg.devDependencies || {})
  .concat(Object.keys(pkg.dependencies || {}))
  .filter(exports.isPlugin)
  .map(id => {
    if (pkg.optionalDependencies && id in pkg.optionalDependencies) {
      let apply = () => {}
      try {
        apply = require(id)
      } catch (e) {
        warn(`Optional dependency ${id} is not installed.`)
      }
      return { id, apply }
    }
    return exports.loadPlugin(id)
  })
  return projectPlugins
}

exports.loadLocalPlugins = (context) => {
  let localPlugins = []
  let pluginPaths = []
  const localPluginPath = path.resolve(context, 'plugins')
  const fs = require("fs");
  if (fs.existsSync(localPluginPath)) {
    pluginPaths = fs.readdirSync(localPluginPath).filter(exports.isPlugin)
  }
  localPlugins = exports.loadPlugins(pluginPaths, localPluginPath)
  
  return localPlugins
}