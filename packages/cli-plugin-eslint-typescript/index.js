
module.exports = (api, options, pluginConfig) => {
  const { error, warn, tryRequire, loadModule, semver } = require('@etherfe/cli-utils')

  api.chainWebpack((chainWebpack) => {
    chainWebpack.resolve
      .extensions
        .merge(['.ts', '.tsx'])
        .end()

    if (api.hasPlugin('babel')) {
      chainWebpack.module
        .rule('js')
        .test(/\.((m|c)?jsx?|tsx?)$/)
        .use('babel-loader')
        .tap(options => {
          options.presets.push([require.resolve('@babel/preset-typescript'), {
            isTSX: true,
            allExtensions: true,
            allowNamespaces: true,
            onlyRemoveTypeImports: true
          }]);
          return options
        })
    } else {
      error( `The project seems to require '@etherfe/cli-plugin-babel' but it's not installed.`)
      process.exit(1)
    }

    const extensions = {}
    if(api.hasPlugin('vue') || api.hasPlugin('vue3')) {
      const vue = loadModule('vue', api.service.context)
      const isVue3 = vue && semver.major(vue.version) === 3
      Object.assign(extensions, {
        vue: {
          enabled: true,
          compiler: isVue3 ? '@vue/compiler-sfc' : 'vue-template-compiler',
        }
      })
    }
    
    chainWebpack.plugin('fork-ts-checker')
      .use(require('fork-ts-checker-webpack-plugin'), [
        {
          typescript: {
            extensions,
            mode: 'write-references',
            diagnosticOptions: {
              syntactic: true,
              semantic: true,
              declaration: false,
              global: false
            }
          },
          formatter: pluginConfig.formatter || 'basic',
        },
      ])

  });
  

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
    if(args['check-eslint-typescript'] !== undefined) return
    const eslintrcConfig = tryRequire(api.resolve('.eslintrc.js'))
    let hasEslintConfig = eslintrcConfig && typeof eslintrcConfig === 'object' && !Array.isArray(eslintrcConfig)
    let eslintExtends = hasEslintConfig && Array.isArray(eslintrcConfig.extends) ? eslintrcConfig.extends : null
    let tipMessage = ['']

    if(!api.hasPlugin('typescript')) {

      if(!api.hasPlugin('vue') && !api.hasPlugin('vue3')&& !api.hasPlugin('react')) {
        if(!eslintExtends || !hasExtends(['plugin:@etherfe/typescript'],eslintExtends) ) {
          tipMessage.push('Example: extends: ["plugin:@etherfe/typescript"]')
          tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/typescript", "plugin:@etherfe/prettier-typescript"]')
          tipMessage.push(`Recommended project use .prettierrc.js config file.`)
        }
      }

      if(api.hasPlugin('vue')) {
        if(!eslintExtends || !hasExtends(['plugin:@etherfe/vue-typescript'],eslintExtends) ) {
          tipMessage.push('Example: extends: ["plugin:@etherfe/vue-typescript"]')
          tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/vue-typescript", "plugin:@etherfe/prettier-vue", "plugin:@etherfe/prettier-typescript"]')
          tipMessage.push(`Recommended project use .prettierrc.js config file.`)
        }
      }

      if(api.hasPlugin('vue3')) {
        if(!eslintExtends || !hasExtends(['plugin:@etherfe/vue3-typescript'],eslintExtends) ) {
          tipMessage.push('Example: extends: ["plugin:@etherfe/vue3-typescript"]')
          tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/vue3-typescript", "plugin:@etherfe/prettier-vue", "plugin:@etherfe/prettier-typescript"]')
          tipMessage.push(`Recommended project use .prettierrc.js config file.`)
        }
      }

      if(api.hasPlugin('react')) {
        if(!eslintExtends || !hasExtends(['plugin:@etherfe/react-typescript'],eslintExtends) ) {
          tipMessage.push('Example: extends: ["plugin:@etherfe/react-typescript"]')
          tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/react-typescript", "plugin:@etherfe/prettier-react", "plugin:@etherfe/prettier-typescript"]')
          tipMessage.push(`Recommended project use .prettierrc.js config file.`)
        }
      }

    } else {
      tipMessage.push(`Recommended project use '@etherfe/cli-plugin-eslint-typescript' plugin. `)
      tipMessage.push(`Please remove '@etherfe/cli-plugin-typescript' plugin. `)
    }

    if(tipMessage.length > 1) {
      tipMessage.push(`Ignore the prompt. --no-check-eslint-typescript`)
      triggerTip(tipMessage)
    }
  })
};

module.exports.defaultConfig = {
  formatter: 'basic'
}