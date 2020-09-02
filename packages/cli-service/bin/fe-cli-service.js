#!/usr/bin/env node
const { checkNodeVersion, error } = require('@etherfe/cli-utils');

const dependVersion = require('../package.json').engines.node;
checkNodeVersion(dependVersion);

const service = require('../lib/Service')
service().catch(err => {
  error(err)
  process.exit(1)
})
