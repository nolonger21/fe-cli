module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    
    webpackConfig.resolve
      .extensions
        .merge(['.vue'])
        .end()
  
    const vueLoaderCacheConfig = api.genCacheConfig('vue-loader', {
      'vue-loader': require('vue-loader/package.json').version,
      '@vue/compiler-sfc': require('@vue/compiler-sfc/package.json').version
    })

    webpackConfig.module
      .rule('vue')
        .test(/\.vue$/)
        .use('cache-loader')
          .loader(require.resolve('cache-loader'))
          .options(vueLoaderCacheConfig)
          .end()
        .use('vue-loader')
          .loader(require.resolve('vue-loader'))
          .options(Object.assign({
            compilerOptions: {
              whitespace: 'condense'
            }
          }, vueLoaderCacheConfig))
  
    webpackConfig
      .plugin('vue-loader')
      .use(require('vue-loader').VueLoaderPlugin)

    if (api.hasPlugin('babel') && api.hasDepend('element-ui')) {
      webpackConfig.module
        .rule('js')
        .use('babel-loader')
        .tap(options => {
          options.plugins.push(
            [
              require.resolve('babel-plugin-component'),
              {
                "libraryName": "element-ui",
                "styleLibraryName": "theme-chalk"
              }
            ]
          );
          return options
        })
    }

    const maybeResolve = name => {
      try {
        return require.resolve(name)
      } catch (error) {
        return name
      }
    }

    webpackConfig.module
      .rule('pug')
        .test(/\.pug$/)
          .oneOf('pug-vue')
            .resourceQuery(/vue/)
            .use('pug-plain-loader')
              .loader(maybeResolve('pug-plain-loader'))
              .end()
            .end()
          .oneOf('pug-template')
            .use('raw')
              .loader(maybeResolve('raw-loader'))
              .end()
            .use('pug-plain-loader')
              .loader(maybeResolve('pug-plain-loader'))
              .end()
            .end()

  });
};
