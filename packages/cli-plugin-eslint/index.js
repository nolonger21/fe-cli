const path = require('path')
const fs = require('fs')

module.exports = (api, options, pluginConfig) => {
  const { error, info, warn, resolveModule, loadModule, tryRequire } = require('@etherfe/cli-utils')
  const cwd = api.getCwd()
  const eslintPkg = loadModule('eslint/package.json', cwd, true)

  if (!eslintPkg) {
    error( `The project seems to require 'eslint' but it's not installed.`)
    process.exit(1)
  }

  const { cacheIdentifier } = api.genCacheConfig(
    'eslint-loader',
    {
      'eslint-loader': require('eslint-loader/package.json').version,
      eslint: eslintPkg.version
    },
    [
      '.eslintrc.js',
      '.eslintrc.yaml',
      '.eslintrc.yml',
      '.eslintrc.json',
      '.eslintrc',
      '.eslintignore',
      'package.json'
    ]
  )
  
  api.chainWebpack(chainWebpack => {
    const eslintPath = resolveModule('eslint/package.json', cwd)
    let matchPatterns = /\.jsx?$/
    const extensions = [ '.mjs', '.cjs', '.js', '.jsx' ]
    let ignorePattern = []

    if (api.hasPlugin('vue') || api.hasPlugin('vue3')) {
      matchPatterns = /\.(vue|jsx?)$/
      extensions.push('.vue')
    }


    if (!fs.existsSync(api.resolve('.eslintignore'))) {
      ignorePattern = [
        '**/*.js',
        '!src/**/*.js'
      ]
    }
    chainWebpack.module
      .rule('eslint')
        .pre()
        .exclude
          .add(/node_modules/)
          .add(path.dirname(require.resolve('@etherfe/cli-service')) + '/')
          .end()
        .test(matchPatterns)
        .use('eslint-loader')
          .loader(require.resolve('eslint-loader'))
          .options({
            extensions,
            ignorePattern,
            cache: true,
            cacheIdentifier,
            emitWarning: true,
            emitError: true,
            eslintPath: path.dirname(eslintPath),
            formatter: pluginConfig.formatter || 'stylish'
          })
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
          if(!api.hasPlugin('vue') && !api.hasPlugin('vue3') && !api.hasPlugin('react')) {
            if(!eslintExtends || !hasExtends(['plugin:@etherfe/recommended'], eslintExtends) ) {
              tipMessage.push('Example: extends: ["plugin:@etherfe/recommended"]')
              tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/recommended", "plugin:@etherfe/prettier"]')
              tipMessage.push(`Recommended project use .prettierrc.js config file.`)
            }
          }
          if(api.hasPlugin('vue') || api.hasPlugin('vue3')) {
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
  formatter: 'stylish'
}