const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  extends: [
    require.resolve('./base'),
    'eslint:recommended'
  ],
  rules: {
    // eslint:recommended turn off these rules
    'no-extra-semi': 0, // 禁止不必要的分号

    /** prettier autofix **/
    // eslint stylistic rules don't turn on. please use prettier autofix.

    /** eslint autofix **/
    curly: 1, // 强制所有控制语句使用一致的括号风格
    'dot-notation': 1, // 强制尽可能地使用点号
    'no-div-regex': 1, // 禁止除法操作符显式的出现在正则表达式开始的位置
    'no-else-return': 1, // 禁止 if 语句中 return 语句之后有 else 块
    'no-extra-bind': 1, // 禁止不必要的 .bind() 调用
    'no-extra-label': 1, // 禁用不必要的标签
    'no-floating-decimal': 1, // 禁止数字字面量中使用前导和末尾小数点
    'no-implicit-coercion': [1, { allow: ['!!', '~'] }], // 禁止使用短符号进行类型转换
    'no-unused-labels': 1, // 禁用出现未使用过的标签
    'no-useless-return': 1, // 禁止多余的 return 语句
    yoda: [1, 'never'], // 要求或禁止 “Yoda” 条件
    quotes: [1, 'single'], // 强制使用一致的反勾号、双引号或单引号

    // recommended rules
    'no-unused-vars': 0, // 禁止出现未使用过的变量
    'no-debugger': isProd ? 2 : 0, // 开发模式下允许debugger
    'no-undef': 2, // 禁止not defined
    'no-template-curly-in-string': 2, // 禁止在常规字符串中出现模板字面量占位符语法 例：'${a}'
    'accessor-pairs': 2, // 强制 getter 和 setter 在对象中成对出现
    'no-eq-null': 2, // 禁止在没有类型检查操作符的情况下与 null 进行比较
    'no-eval': 2, // 禁用 eval()
    'no-implied-eval': 2, // 禁止使用类似 eval() 的方法
    'no-extend-native': 2, // 禁止扩展原生类
    'no-invalid-this': 2, // 禁止 this 关键字出现在类和类对象之外
    'no-loop-func': 2, // 禁止在循环语句中出现包含不安全引用的函数声明
    'no-new-wrappers': 2, // 禁止对 String，Number 和 Boolean 使用 new 操作符
    'no-multi-str': 2, // 禁止使用多行字符串
    'no-return-assign': 2, // 禁止在 return 语句中使用赋值语句
    'no-return-await': 2, // 禁用不必要的 return await
    'no-script-url': 2, // 禁止使用 javascript: url
    'no-self-compare': 2, // 禁止自身比较
    'no-sequences': 2, // 禁用逗号操作符
    'no-throw-literal': 2, // 禁止抛出异常字面量
    'prefer-promise-reject-errors': 2, // 要求使用 Error 对象作为 Promise 拒绝的原因
    'no-label-var': 2, // 不允许标签与变量同名
    'no-shadow': 2, // 禁止变量声明与外层作用域的变量同名
    'no-use-before-define': 2, // 禁止在变量定义之前使用它们
    'no-nested-ternary': 1, // 禁止嵌套的三元表达式
    'eqeqeq': 2 // 必须全等
  },
}
