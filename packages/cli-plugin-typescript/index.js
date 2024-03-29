const path = require('path')
const fs = require('fs')

const { semver, loadModule, os, warn, error, tryRequire, getPkgMajor } = require('@etherfe/cli-utils')

module.exports = (api, options, pluginConfig) => {
  const useThreads = process.env.NODE_ENV === 'production' && !!pluginConfig.parallel
  const forkTsCheckerOptions = pluginConfig.forkTsCheckerOptions || {}
  const typescriptOptions = pluginConfig.typescriptOptions || {}
  const isEsLint = typescriptOptions.linter === 'eslint'
  const isBabelParse = typescriptOptions.parser === 'babel'
  const hasVue = api.hasPlugin('vue')
  const cwd = api.getCwd()
  const vueMajor = getPkgMajor('vue', cwd, 2)

  api.chainWebpack((chainWebpack) => {
    chainWebpack.resolveLoader.modules
      .prepend(path.join(__dirname, 'node_modules'))
    chainWebpack.resolve.extensions
      .prepend('.ts').prepend('.tsx')

    if (isBabelParse) {
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
    } else {
      const tsRe = api.hasPlugin('babel') ? /\.ts$/ : /\.(j|t)s$/
      const tsxRe = api.hasPlugin('babel') ? /\.tsx$/ : /\.(j|t)sx$/
      const tsRule = chainWebpack.module.rule('ts').test(tsRe)
      const tsxRule = chainWebpack.module.rule('tsx').test(tsxRe)
  
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
          threadOptions = { workers: cpus.length }
        }
  
        addLoader({
          name: 'thread-loader',
          loader: require.resolve('thread-loader'),
          options: threadOptions,
        })
      }

      if (api.hasPlugin('babel')) {

        let babelOptions
        chainWebpack.module
          .rule('js')
          .use('babel-loader')
          .tap(options => {
            babelOptions = options
            return options
          })
          
        addLoader({
          name: 'babel-loader',
          loader: require.resolve('babel-loader'),
          options: babelOptions
        })
      }
  
      const appendTsSuffixTo = []
      if (hasVue) {
        appendTsSuffixTo.push('\\.vue$')
      }
  
      addLoader({
        name: 'ts-loader',
        loader: require.resolve('ts-loader'),
        options: {
          transpileOnly: true,
          appendTsSuffixTo,
          happyPackMode: useThreads,
          getCustomTransformers: typescriptOptions.getCustomTransformers
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
      
    }
    
    let vueConfig = {}
    if (hasVue) {
      vueConfig = {
        enabled: true,
        compiler: vueMajor === 3 ? '@vue/compiler-sfc' : 'vue-template-compiler',
      }
    }
    if (isEsLint || vueMajor === 3) {
      const extensions = {}
      if(hasVue) {
        Object.assign(extensions, { vue: vueConfig })
      }
      
      chainWebpack.plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [
          {
            async: forkTsCheckerOptions.async,
            formatter: forkTsCheckerOptions.formatter || 'basic',
            eslint: {
              enabled: forkTsCheckerOptions.eslint,
              files: './src/**/*.{ts,tsx,js,jsx}',
              memoryLimit: forkTsCheckerOptions.memoryLimit,
              options: {}
            },
            typescript: {
              extensions,
              mode: 'write-references',
              diagnosticOptions: {
                syntactic: true,
                semantic: true,
                declaration: false,
                global: false
              },
              memoryLimit: forkTsCheckerOptions.memoryLimit
            }
          },
        ])

    } else {
      chainWebpack.plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin-3'), [
        {
          async: forkTsCheckerOptions.async,
          formatter: forkTsCheckerOptions.formatter || 'default',
          vue: hasVue ? vueConfig : undefined,
          eslint: forkTsCheckerOptions.eslint,
          tslint: fs.existsSync(api.resolve('tslint.json')),
          checkSyntacticErrors: true,
          memoryLimit: forkTsCheckerOptions.memoryLimit
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

    const tsconfig = tryRequire(api.resolve('tsconfig.json'))
    let hasTsConfig = tsconfig && typeof tsconfig === 'object' && !Array.isArray(tsconfig)
    let tsJsx = hasTsConfig && tsconfig.compilerOptions ? tsconfig.compilerOptions.jsx : ''

    let tipMessage = ['']

    if(isEsLint && isBabelParse) {
      if(!api.hasPlugin('vue') && !api.hasPlugin('react') && !tsJsx.includes('react')) {
        if(!eslintExtends || !hasExtends(['plugin:@etherfe/typescript'],eslintExtends) ) {
          tipMessage.push('Example: extends: ["plugin:@etherfe/typescript"]')
          tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/typescript", "plugin:@etherfe/prettier-typescript"]')
          tipMessage.push(`Recommended project use .prettierrc.js config file.`)
        }
      }

      if(api.hasPlugin('vue')) {
        const appendText = vueMajor === 3 ? '3' : ''
        if(!eslintExtends || !hasExtends([`plugin:@etherfe/vue${appendText}-typescript`],eslintExtends) ) {
          tipMessage.push(`Example: extends: ["plugin:@etherfe/vue${appendText}-typescript"]`)
          tipMessage.push(`Open prettier config example: extends: ["plugin:@etherfe/vue${appendText}-typescript", "plugin:@etherfe/prettier-vue", "plugin:@etherfe/prettier-typescript"]`)
          tipMessage.push(`Recommended project use .prettierrc.js config file.`)
        }
      }

      if(api.hasPlugin('react') || tsJsx.includes('react')) {
        if(!eslintExtends || !hasExtends(['plugin:@etherfe/react-typescript'],eslintExtends) ) {
          tipMessage.push('Example: extends: ["plugin:@etherfe/react-typescript"]')
          tipMessage.push('Open prettier config example: extends: ["plugin:@etherfe/react-typescript", "plugin:@etherfe/prettier-react", "plugin:@etherfe/prettier-typescript"]')
          tipMessage.push(`Recommended project use .prettierrc.js config file.`)
        }
      }

    }


    if((!isEsLint && !isBabelParse)) {
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

module.exports.defaultConfig = {
  parallel: undefined,
  typescriptOptions: {
    linter: 'tslint',
    parser: 'ts'
  },
  forkTsCheckerOptions: {
    async: true,
    formatter: '',
    eslint: false,
    memoryLimit: 2048
  }
}
