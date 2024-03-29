const path = require('path')
const fs = require('fs')

module.exports = (api, options, pluginConfig) => {
  const forkTsCheckerOptions = pluginConfig.forkTsCheckerOptions || {}
  const isCloseOutLog = api.hasPlugin('typescript') && forkTsCheckerOptions.eslint === true
  if (isCloseOutLog) return
  const useThreads = process.env.NODE_ENV === 'production' && !!pluginConfig.parallel

  const { error, warn, loadModule, tryRequire } = require('@etherfe/cli-utils')
  const cwd = api.getCwd()

  const eslintPkg = loadModule('eslint/package.json', cwd, true)

  if (!eslintPkg) {
    error( `The project seems to require 'eslint' but it's not installed.`)
    process.exit(1)
  }
  
  api.chainWebpack(chainWebpack => {
    const extensions = [ 'mjs', 'cjs', 'js', 'jsx' ]
    if (api.hasPlugin('vue')) {
      extensions.push('vue')
    }
    if (api.hasPlugin('typescript') || api.hasPlugin('eslint-typescript')) {
      extensions.push('ts')
      extensions.push('tsx')
    }

    const overrideConfig = {}
    if (!fs.existsSync(api.resolve('.eslintignore'))) {
      overrideConfig.ignorePatterns = [
        '**/*.js',
        '!src/**/*.js',
        'src/assets/*.js'
      ]
    }

    chainWebpack
      .plugin('eslint')
        .use(require.resolve('eslint-webpack-plugin'), [{
          context: cwd,
          files: [`src/**/*.{${extensions.join(',')}}`],
          cache: true,
          cacheLocation: api.resolve('node_modules/.cache/.eslintcache/'),
          exclude: ['node_modules'],
          threads: useThreads,
          eslintPath: require.resolve('eslint'),
          formatter: 'stylish',
          fix: false,
          overrideConfig,
          ...pluginConfig.eslintOptions
        }])

  })

  const triggerTip = (msgs) => warn(msgs.join(('\n')), require('./package.json').name)
  const hasExtends = (extendList, eslintExtends) => {
    let result = true
    for (extend of extendList) {
      result = eslintExtends.includes(extend)
      if(!result) {
        break
      }
    }
    return result
  }
  api.addRunCheck(args => {
    if(args['check-eslint'] !== undefined) return
    const eslintrcConfig = tryRequire(api.resolve('.eslintrc.js'))
    let hasEslintConfig = eslintrcConfig && typeof eslintrcConfig === 'object' && !Array.isArray(eslintrcConfig)
    let eslintExtends = hasEslintConfig && Array.isArray(eslintrcConfig.extends) ? eslintrcConfig.extends : null
    let tipMessage = ['']

    if(!hasEslintConfig) {
      tipMessage.push(`Recommended project use .eslintrc.js config file.`)
      tipMessage.push(`Config guide: https://eslint.org/docs/user-guide/configuring`)
    } else {

      if(!api.hasDepend('@etherfe/eslint-plugin')) {
        tipMessage.push(`Recommended to install '@etherfe/eslint-plugin' plugin.`)
        tipMessage.push(`Please use "plugin:@etherfe/{type}" extend config to .eslintrc.js {extends} field.`)
      } else {
        if(!eslintExtends) {
          tipMessage.push(`Please use "plugin:@etherfe/{type}" extend config to .eslintrc.js {extends} field.`)
        }
        if(!api.hasPlugin('eslint-typescript') && !api.hasPlugin('typescript')) {
          if(!api.hasPlugin('vue') && !api.hasPlugin('react')) {
            if(!eslintExtends || !hasExtends(['plugin:@etherfe/recommended'], eslintExtends) ) {
              tipMessage.push('Example: extends: ["plugin:@etherfe/recommended"]')
              tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/recommended", "plugin:@etherfe/prettier"]')
              tipMessage.push(`Recommended project use .prettierrc.js config file.`)
            }
          }
          if(api.hasPlugin('vue')) {
            if(!eslintExtends || !hasExtends(['plugin:@etherfe/vue'], eslintExtends) ) {
              tipMessage.push('Example: extends: ["plugin:@etherfe/vue"]')
              tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/vue", "plugin:@etherfe/prettier-vue"]')
              tipMessage.push(`Recommended project use .prettierrc.js config file.`)
            }
          }
          if(api.hasPlugin('react')) {
            if(!eslintExtends || !hasExtends(['plugin:@etherfe/react'], eslintExtends) ) {
              tipMessage.push('Example: extends: ["plugin:@etherfe/react"]')
              tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/react", "plugin:@etherfe/prettier-react"]')
              tipMessage.push(`Recommended project use .prettierrc.js config file.`)
            }
          }
        }
      }
    }
    if(tipMessage.length > 1) {
      tipMessage.push(`Ignore the prompt. --no-check-eslint`)
      triggerTip(tipMessage)
    }
  })
}

module.exports.defaultConfig = {
  parallel: undefined,
  eslintOptions: {
    formatter: 'stylish',
    fix: false
  }
}