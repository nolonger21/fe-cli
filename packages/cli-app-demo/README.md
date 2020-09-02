

# fe-cli-service app-demo

Based on vue-cli-service https://github.com/vuejs/vue-cli design transformation

## commands
```
  "scripts": {
    "serve": "fe-cli-service serve",
    "build": "fe-cli-service build",
    "inspect": "fe-cli-service inspect",
    "lint": "eslint src --ext .js,.vue --fix"
  },
```


# use exmple

## vue project
vue + babel + eslint + typescript(eslint)

package.json
```
  "dependencies": {
    "core-js": "^3.6.5",
    "vue": "^2.6.11"
  },
  "devDependencies": {
    "@etherfe/cli-plugin-babel": "0.0.0",
    "@etherfe/cli-plugin-eslint": "0.0.0",
    "@etherfe/cli-plugin-eslint-typescript": "0.0.0",
    "@etherfe/cli-plugin-vue": "0.0.0",
    "@etherfe/cli-service": "0.0.0",
    "@etherfe/eslint-plugin": "0.0.0",
    "@typescript-eslint/eslint-plugin": "^3.10.1",
    "eslint": "^7.7.0",
    "typescript": "^4.0.2",
    "vue-class-component": "^7.2.5",
    "vue-template-compiler": "^2.6.11"
  }

```

.eslintrc.js
```
module.exports = {
  root: true,
  extends: [
    'plugin:@etherfe/vue-typescript',
    'plugin:@etherfe/prettier-vue',
    'plugin:@etherfe/prettier-typescript',
  ],
  rules: {
    // other rules
  }
};

```


## vue 3 exmple
vue3 + babel + eslint + typescript(eslint)

package.json

```
  "dependencies": {
    "axios": "^0.20.0",
    "core-js": "^3.6.5",
    "element-ui": "^2.13.2",
    "vue": "^3.0.0-rc.9",
    "vue-router": "^4.0.0-beta.7",
    "vuex": "^4.0.0-beta.4"
  },
  "devDependencies": {
    "@etherfe/cli-plugin-babel": "0.0.0",
    "@etherfe/cli-plugin-eslint": "0.0.0",
    "@etherfe/cli-plugin-eslint-typescript": "0.0.0",
    "@etherfe/cli-plugin-vue3": "0.0.0",
    "@etherfe/cli-service": "0.0.0",
    "@etherfe/eslint-plugin": "0.0.0",
    "@typescript-eslint/eslint-plugin": "^3.10.1",
    "@vue/compiler-sfc": "^3.0.0-rc.9",
    "eslint": "^7.7.0",
    "regenerator-runtime": "^0.13.7",
    "typescript": "^4.0.2",
    "vue-class-component": "^7.2.5"
  },
```

.eslintrc.js
```
module.exports = {
  root: true,
  extends: [
    'plugin:@etherfe/vue3-typescript',
    'plugin:@etherfe/prettier-vue',
    'plugin:@etherfe/prettier-typescript',
  ],
  rules: {
    // other rules
  }
};

```



## react project
react + babel + eslint + typescript(eslint)

package.json
```
  "dependencies": {
    "core-js": "^3.6.5",
    "react": "^16.13.1",
    "react-dom": "^16.13.1"
  },
  "devDependencies": {
    "@etherfe/cli-plugin-babel": "0.0.0",
    "@etherfe/cli-plugin-eslint": "0.0.0",
    "@etherfe/cli-plugin-eslint-typescript": "0.0.0",
    "@etherfe/cli-plugin-react": "0.0.0",
    "@etherfe/cli-service": "0.0.0",
    "@etherfe/eslint-plugin": "0.0.0",
    "@types/node": "^14.6.2",
    "@types/react": "^16.9.48",
    "@types/react-dom": "^16.9.8",
    "@typescript-eslint/eslint-plugin": "^3.10.1",
    "eslint": "^7.7.0",
    "regenerator-runtime": "^0.13.7",
    "typescript": "^4.0.2"
  }

```

.eslintrc.js
```
module.exports = {
  root: true,
  extends: [
    "plugin:@etherfe/react-typescript",
    "plugin:@etherfe/prettier-react",
    "plugin:@etherfe/prettier-typescript"
  ],
  rules: {
    // other rules
  }
};

```
