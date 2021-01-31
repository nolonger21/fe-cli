

# fe-cli-app-example


.eslintrc.js

```js
module.exports = {
  root: true,
  extends: ['plugin:@etherfe/vue', 'plugin:@etherfe/prettier-vue'],
  rules: {},
}

```

.prettierrc.js

```js
// Need to be consistent with ESLint -> plugin:@etherfe/prettier-vue
// The editor 'Prettier' plugin is used

module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  semi: false,
  trailingComma: "es5",
  bracketSpacing: true
}
```