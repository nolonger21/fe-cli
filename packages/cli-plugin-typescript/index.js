const path = require('path')
const fs = require('fs')

const { semver, loadModule, os, warn, tryRequire } = require('@etherfe/cli-utils')

module.exports = (api, options) => {
  const useThreads = process.env.NODE_ENV === 'production'

  api.chainWebpack((webpackConfig) => {
    webpackConfig.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'))

    webpackConfig.resolve.extensions.prepend('.ts').prepend('.tsx')

    const tsRule = webpackConfig.module.rule('ts').test(/\.ts$/)
    const tsxRule = webpackConfig.module.rule('tsx').test(/\.tsx$/)

    const addLoader = ({ name, loader, options }) => {
      tsRule.use(name).loader(loader).options(options)
      tsxRule.use(name).loader(loader).options(options)
    }

    addLoader({
      name: 'cache-loader',
      loader: require.resolve('cache-loader'),
      options: api.genCacheConfig(
        'ts-loader',
        {
          'ts-loader': require('ts-loader/package.json').version,
          typescript: require('typescript/package.json').version,
        },
        'tsconfig.json'
      ),
    })

    if (useThreads) {
      const cpus = os.cpus()
      let threadOptions = {}
      if (cpus && cpus.length > 1) {
        threadOptions({ workers: cpus.length })
      }

      addLoader({
        name: 'thread-loader',
        loader: require.resolve('thread-loader'),
        options: threadOptions,
      })
    }

    if (api.hasPlugin('babel')) {
      addLoader({
        name: 'babel-loader',
        loader: require.resolve('babel-loader'),
      })
    }

    const appendTsSuffixTo = []
    if (api.hasPlugin('vue') || api.hasPlugin('vue3')) {
      appendTsSuffixTo.push('\\.vue$')
    }

    addLoader({
      name: 'ts-loader',
      loader: require.resolve('ts-loader'),
      options: {
        transpileOnly: true,
        appendTsSuffixTo,
        happyPackMode: useThreads,
      },
    })
    // https://github.com/TypeStrong/ts-loader#appendtsxsuffixto
    tsxRule
      .use('ts-loader')
      .loader(require.resolve('ts-loader'))
      .tap((options) => {
        options = Object.assign({}, options)
        delete options.appendTsSuffixTo
        options.appendTsxSuffixTo = ['\\.vue$']
        return options
      })

    const vue = loadModule('vue', api.service.context)
    const isVue3 = vue && semver.major(vue.version) === 3
    if (isVue3) {
      if(semver.major(require('fork-ts-checker-webpack-plugin/package.json').version) < 5) {
        error( `Please upgrade 'fork-ts-checker-webpack-plugin' to version 5.x.x .`)
        process.exit(1)
      }
      webpackConfig.plugin('fork-ts-checker').use(require('fork-ts-checker-webpack-plugin'), [
        {
          typescript: {
            extensions: {
              vue: {
                enabled: true,
                compiler: '@vue/compiler-sfc',
              },
            },
            diagnosticOptions: {
              semantic: true,
              syntactic: useThreads,
            },
          },
        },
      ])
    } else {
      webpackConfig.plugin('fork-ts-checker').use(require('fork-ts-checker-webpack-plugin'), [
        {
          vue: { enabled: true, compiler: 'vue-template-compiler' },
          tslint: fs.existsSync(api.resolve('tslint.json')),
          formatter: 'codeframe',
          checkSyntacticErrors: useThreads,
        },
      ])
    }
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
    if(args['check-typescript'] !== undefined) return
    const eslintrcConfig = tryRequire(api.resolve('.eslintrc.js'))
    let hasEslintConfig = eslintrcConfig && typeof eslintrcConfig === 'object' && !Array.isArray(eslintrcConfig)
    let eslintExtends = hasEslintConfig && Array.isArray(eslintrcConfig.extends) ? eslintrcConfig.extends : null
    let tipMessage = ['']

    if(!api.hasPlugin('eslint-typescript')) {
      if(eslintExtends && hasExtends(['plugin:@etherfe/typescript'],eslintExtends) ) {
        tipMessage.push('Example: extends: ["plugin:@etherfe/recommended"]')
        tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/recommended", "plugin:@etherfe/prettier"]')
        tipMessage.push(`Recommended project use .prettierrc.js config file.`)
      }
    }

    if(tipMessage.length > 1) {
      tipMessage.push(`Ignore the prompt. --no-check-typescript`)
      triggerTip(tipMessage)
    }
  })
}
