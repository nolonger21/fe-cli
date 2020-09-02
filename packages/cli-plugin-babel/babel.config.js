let config = {
  presets: [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "useBuiltIns": "usage",
        "corejs": 3
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
        "loose": true
      }
    ]
  ],
  exclude: [/node_modules/]
};

module.exports = config;