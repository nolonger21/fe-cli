

module.exports = {
    plugins: ['react', 'react-hooks'],
    extends: [
      require.resolve('./recommended'),
      'plugin:react/recommended',
      'plugin:react-hooks/recommended'
    ],
    rules: {
      "react/jsx-uses-react": 2,
      "react/jsx-uses-vars": 2,
      'react-hooks/rules-of-hooks': 2,
      "react-hooks/exhaustive-deps": 1
    },
    settings: {
      react: {
        pragma: "React",
        version: "detect"
      }
    }
  };
  