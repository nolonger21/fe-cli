
var HtmlWebpackPlugin;

try {
  // eslint-disable-next-line global-require
  HtmlWebpackPlugin = require('html-webpack-plugin');
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }
}
// support webpack 4/5
module.exports = class CorsPlugin {
  constructor ({ publicPath, crossorigin, integrity }) {
    this.crossorigin = crossorigin
    this.integrity = integrity
    this.publicPath = publicPath
  }

  apply (compiler) {
    const ID = `vue-cli-cors-plugin`
    compiler.hooks.compilation.tap(ID, compilation => {
      const ssri = require('ssri')

      const computeHash = url => {
        const filename = url.replace(this.publicPath, '')
        const asset = compilation.assets[filename]
        if (asset) {
          const src = asset.source()
          const integrity = ssri.fromData(src, {
            algorithms: ['sha384']
          })
          return integrity.toString()
        }
      }

      const alterAssetTagGroupsCallback = _data => {
        const data = {
          head: _data.headTags || _data.head,
          body: _data.bodyTags || _data.body
        }
        const tags = [...data.head, ...data.body]

        if (this.crossorigin != null) {
          tags.forEach(tag => {
            if (tag.tagName === 'script' || tag.tagName === 'link') {
              tag.attributes.crossorigin = this.crossorigin
            }
          })
        }
        if (this.integrity) {
          tags.forEach(tag => {
            if (tag.tagName === 'script') {
              const hash = computeHash(tag.attributes.src)
              if (hash) {
                tag.attributes.integrity = hash
              }
            } else if (tag.tagName === 'link' && tag.attributes.rel === 'stylesheet') {
              const hash = computeHash(tag.attributes.href)
              if (hash) {
                tag.attributes.integrity = hash
              }
            }
          })

          data.head = data.head.filter(tag => {
            return !(
              tag.tagName === 'link' &&
              tag.attributes.rel === 'preload'
            )
          })
        }
      }

      const afterTemplateExecutionCallback = data => {
        data.html = data.html.replace(/\scrossorigin=""/g, ' crossorigin')
      }

      if (HtmlWebpackPlugin && HtmlWebpackPlugin.getHooks) { // HtmlWebpackPlugin >= 4
        const hooks = HtmlWebpackPlugin.getHooks(compilation)
        hooks.alterAssetTagGroups.tap(ID, alterAssetTagGroupsCallback)
        hooks.afterTemplateExecution.tap(ID, afterTemplateExecutionCallback)

      } else {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tap(ID, alterAssetTagGroupsCallback)
        compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(ID, afterTemplateExecutionCallback)
      }

    })
  }
}
