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

exports.resolvePluginId = (_id, supportLocal) => {
  let id = _id
  if (supportLocal) {
    id = id.replace('build-in', '').replace('local:', '')
  }
  if (pluginRE.test(id)) return _id
  return `fe-cli-plugin-${id}`
}

exports.matchesPluginId = (input, full) => {
  const short = full.replace(pluginRE, '')
  return ( full === input || short === input);
}

exports.idFix = (id) => {
  return id.replace(/^.\//, 'built-in:').replace(/^\//, 'local:')
}
exports.loadPlugin = (id, context) => {
  let targetPath = '';
  if (context) {
    targetPath = path.join(context, id)
  }
  return {
    id: exports.idFix(id),
    apply: require(targetPath || id)
  }
}

exports.loadPlugins = (pluginPaths = [], context, callback) => {
  return pluginPaths.filter(path => {
    let pass = true
    if (typeof callback === 'function') {
      const res = callback(exports.idFix(path))
      pass = res !== undefined ? res : pass
    }
    return pass
  }).map(path => exports.loadPlugin(path, context))
}

exports.loadPkgPlugins = (pkg = {}, callback) => {
  const projectPlugins = Object.keys(pkg.devDependencies || {})
  .concat(Object.keys(pkg.dependencies || {}))
  .filter(path => {
    let pass = true
    let isPlugin = exports.isPlugin(path)
    if (typeof callback === 'function' && isPlugin) {
      const res = callback(path)
      pass = res !== undefined ? res : pass
    }
    return pass && isPlugin
  })
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

exports.loadLocalPlugins = (context, callback) => {
  let localPlugins = []
  const localPluginPath = path.resolve(context, 'plugins')
  const fs = require("fs");
  if (fs.existsSync(localPluginPath)) {
    localPlugins = fs.readdirSync(localPluginPath).filter(path => {
      let pass = true
      if (typeof callback === 'function') {
        const res = callback('local:' + path)
        pass = res !== undefined ? res : pass
      }
      return pass && exports.isPlugin(path)
    }).map(_path => {
      let targetPath = path.join(localPluginPath, _path)
      return {
        id: 'local:' + _path,
        apply: require(targetPath)
      }
    })
  }
  return localPlugins
}