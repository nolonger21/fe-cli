
module.exports = {
  extends: [
    require.resolve('./recommended')
  ],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd()
      },
      plugins: ["@typescript-eslint"],
      extends: [
        require.resolve('./recommended'),
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
      rules: {
        "@typescript-eslint/naming-convention": [ 2,
          { 
            'selector': 'interface',
            'format': ['PascalCase'],
            'prefix': ['I']
          },
        ],
        'no-unused-vars': 2
      }
    }
  ]
};
