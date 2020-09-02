
const path = require('path')
const fs = require('fs')

exports.resolveEntryIndex = (context) => {
  const indexPaths = [
    'src/index.js',
    'src/main.js',
    'src/index.ts',
    'src/main.ts',
    'src/index.jsx',
    'src/main.jsx',
    'src/index.tsx',
    'src/main.tsx'
  ]
  let indexPath
  for (const _path of indexPaths) {
    const resolvedPath = _path && path.resolve(context, _path)
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      indexPath = resolvedPath
      break
    }
  }
  return indexPath
}