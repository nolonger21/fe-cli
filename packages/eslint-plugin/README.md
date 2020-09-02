
## eslint config extends

### javascript
- plugin:@etherfe/base
    - eslint:recommended

### typescript
- plugin:@etherfe/typescript
    - plugin:@etherfe/base
        - eslint:recommended

### vue
- plugin:@etherfe/vue
    - plugin:@etherfe/base
        - eslint:recommended

### vue + typescript
- plugin:@etherfe/vue-typescript
    - plugin:@etherfe/typescript
        - plugin:@etherfe/base
            - eslint:recommended

### react
- plugin:@etherfe/react
    - plugin:@etherfe/base
        - eslint:recommended

### react + typescript
- plugin:@etherfe/react-typescript
    - plugin:@etherfe/typescript
        - plugin:@etherfe/base
            - eslint:recommended

## example:

```
js 

  extends: [
    'plugin:@etherfe/base'
  ]
```

```
ts 

  extends: [
    'plugin:@etherfe/typescript'
  ]
```

### prettier
- plugin:@etherfe/prettier
    - prettier
    - plugin:prettier/recommended

### vue-prettier
- plugin:@etherfe/prettier
    - prettier
    - prettier/vue
    - plugin:prettier/recommended


## prettier example:

```
js + prettier 

  extends: [
    'plugin:@etherfe/base'
    'plugin:@etherfe/prettier'
  ]
```

```
ts + prettier

  extends: [
    'plugin:@etherfe/typescript'
    'plugin:@etherfe/prettier'
  ]
```

```
vue + prettier

  extends: [
    'plugin:@etherfe/vue'
    'plugin:@etherfe/vue-prettier'
  ]
```

```
vue + ts + prettier

  extends: [
    'plugin:@etherfe/vue-typescript'
    'plugin:@etherfe/vue-prettier'
  ]
```