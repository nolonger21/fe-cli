let config = {
  presets: [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "useBuiltIns": "usage",
        "corejs": 3,
        "loose": false
      }
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-object-rest-spread",
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ],
    [
      "@babel/plugin-proposal-class-properties",
      {
        "loose": false
      }
    ]
  ],
  exclude: [/node_modules/]
};

module.exports = config;