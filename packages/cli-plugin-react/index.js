module.exports = (api, options) => {
  const { error, warn } = require('@etherfe/cli-utils')

  api.chainWebpack((chainWebpack) => {

    if (api.hasPlugin('babel')) {
      chainWebpack.module
        .rule('js')
        .use('babel-loader')
        .tap(options => {
          if(api.hasPlugin('eslint-typescript')) {
            const eslintTsIndex = options.presets.findIndex(item => Array.isArray(item) && item[0] && item[0].includes('@babel/preset-typescript'))
            if(options.presets[eslintTsIndex] && options.presets[eslintTsIndex][1]) {
              options.presets[eslintTsIndex][1].jsxPragma = 'React'
            }
          }
          options.presets.unshift(require.resolve('@babel/preset-react'))
          return options
        })
    }  else {
      error( `The project seems to require '@etherfe/cli-plugin-babel' but it's not installed.`)
      process.exit(1)
    }

  });
};
