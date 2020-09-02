
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const prefixRE = /^APP_/

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

exports.resolveClientEnv = (options, raw) => {
  const env = {}
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || key === 'NODE_ENV') {
      env[key] = process.env[key]
    }
  })
  env.BASE_URL = options.output.publicPath

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
