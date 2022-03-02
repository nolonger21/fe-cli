const { warn, getPkgMajor } = require("@etherfe/cli-utils");
const path = require('path')

module.exports = (api, options, pluginConfig) => {
  const cwd = api.getCwd();
  const webpack = require('webpack');
  const vueMajor = getPkgMajor('vue', cwd, 2);

  api.chainWebpack((chainWebpack) => {
    chainWebpack.resolve.extensions.merge([".vue"]).end();

    chainWebpack.module.noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/);

    // vue 2
    if (vueMajor === 2) {

      const runtimeVersion = pluginConfig.runtimeCompiler ? "" : ".runtime";
      chainWebpack.resolve.alias.set(
        "vue$",
        `vue/dist/vue${runtimeVersion}.esm.js`
      );

      const vueLoaderCacheIdentifier = {
        "vue-loader": require("vue-loader/package.json").version,
      };

      try {
        vueLoaderCacheIdentifier["@vue/component-compiler-utils"] =
          require("@vue/component-compiler-utils/package.json").version;
        vueLoaderCacheIdentifier["vue-template-compiler"] =
          require("vue-template-compiler/package.json").version;
      } catch (e) {}

      const vueLoaderCacheConfig = api.genCacheConfig(
        "vue-loader",
        vueLoaderCacheIdentifier
      );

      chainWebpack.module
        .rule("vue")
        .test(/\.vue$/)
        .use("cache-loader")
          .loader(require.resolve("cache-loader"))
          .options(vueLoaderCacheConfig)
          .end()
        .use("vue-loader")
          .loader(require.resolve("@vue/vue-loader-v15"))
          .options(
            Object.assign(
              {
                compilerOptions: {
                  whitespace: "condense",
                },
              },
              vueLoaderCacheConfig
            )
          );

      chainWebpack
        .plugin("vue-loader")
        .use(require("@vue/vue-loader-v15").VueLoaderPlugin);

      chainWebpack.resolveLoader.modules.prepend(
        path.resolve(__dirname, "./vue-loader-v15-resolve-compat")
      );
    } else if (vueMajor === 3) {
      // vue 3
      chainWebpack.resolve.alias.set(
        "vue$",
        pluginConfig.runtimeCompiler
          ? "vue/dist/vue.esm-bundler.js"
          : "vue/dist/vue.runtime.esm-bundler.js"
      );
  
      const vueLoaderCacheConfig = api.genCacheConfig("vue-loader", {
        "vue-loader": require("vue-loader/package.json").version,
        '@vue/compiler-sfc': require('@vue/compiler-sfc/package.json').version
      });
  
      chainWebpack.module
        .rule('vue')
          .test(/\.vue$/)
          .use('cache-loader')
            .loader(require.resolve('cache-loader'))
            .options(vueLoaderCacheConfig)
            .end()
          .use('vue-loader')
            .loader(require.resolve('vue-loader'))
            .options({
              ...vueLoaderCacheConfig,
              compilerOptions: {
                whitespace: 'condense'
              },
              babelParserPlugins: ['jsx', 'classProperties', 'decorators-legacy']
            })
  
      chainWebpack
        .plugin("vue-loader")
          .use(require("vue-loader").VueLoaderPlugin);
  
      // feature flags <http://link.vuejs.org/feature-flags>
      chainWebpack
        .plugin('feature-flags')
          .use(webpack.DefinePlugin, [{
            __VUE_OPTIONS_API__: 'true',
            __VUE_PROD_DEVTOOLS__: 'false'
          }]);
    }

    // other

    // https://github.com/vuejs/vue-loader/issues/1435#issuecomment-869074949
    chainWebpack.module
      .rule('vue-style')
        .test(/\.vue$/)
          .resourceQuery(/type=style/)
            .sideEffects(true)

    if (api.hasPlugin("babel")) {
      chainWebpack.module
        .rule("js")
        .use("babel-loader")
        .tap((options) => {
          if (vueMajor === 2) {
            options.presets.push(require.resolve("@vue/babel-preset-jsx"));
          } else if (vueMajor === 3) {
            options.plugins.push(require.resolve("@vue/babel-plugin-jsx"));
          }
          options.plugins.push([
            require.resolve("babel-plugin-component"),
            {
              libraryName: "element-ui",
              styleLibraryName: "theme-chalk",
            },
          ]);
          return options;
        });
    }

    const maybeResolve = (name) => {
      try {
        return require.resolve(name);
      } catch (error) {
        return name;
      }
    };

    chainWebpack.module
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

  const triggerTip = (msgs) => warn(msgs.join(('\n')), require('./package.json').name)
  api.addRunCheck(args => {
    if(args['check-vue'] !== undefined) return
    let tipMessage = ['']

    if(!api.hasDepend('vue')) {
      tipMessage.push(`The project seems to require 'vue' but it's not installed.`)
    }

    const compilerPkgName = vueMajor === 3 ? '@vue/compiler-sfc' : 'vue-template-compiler'
    if(!api.hasDepend(compilerPkgName)) {
      tipMessage.push(`The project seems to require '${compilerPkgName}' but it's not installed.`)
    }

    if(tipMessage.length > 1) {
      tipMessage.push(`Ignore the prompt. --no-check-vue`)
      triggerTip(tipMessage)
    }
  })
};

module.exports.defaultConfig = {
  // boolean, use full build?
  runtimeCompiler: false,
};
