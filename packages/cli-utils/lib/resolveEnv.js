
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

exports.loadEnvFile = (envPath) => {
  try {
    const env = dotenv.config({ path: envPath, debug: process.env.DEBUG })
    dotenvExpand(env)
  } catch (err) {
    if (err.toString().indexOf('ENOENT') < 0) {
      error(err)
    }
  }
}

exports.resolveEnvFiles = (context, mode) => {
  const dotenv = path.resolve(context, '.env')
  const dotenvFiles = [
    `${dotenv}.${mode}.local`,
    `${dotenv}.${mode}`,
    mode !== "test" && `${dotenv}.local`,
    dotenv
  ].filter(Boolean);

  dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
      exports.loadEnvFile(dotenvFile)
    }
  });
}

exports.resolveClientEnv = (_prefixRE, envMap, raw) => {
  const prefixRE = _prefixRE || /^APP_/
  const env = {}
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || key === 'NODE_ENV') {
      env[key] = process.env[key]
    }
  })
  
  if (envMap && typeof envMap === 'object') {   
    Object.keys(envMap).forEach(key => {
      env[key] = envMap[key]
    }) 
  }

  if (raw) {
    return env
  }

  for (const key in env) {
    env[key] = JSON.stringify(env[key])
  }
  return {
    'process.env': env
  }
}
