'use strict'
const path = require('path')
const { dirToGather } = require('./lib/dir')

const libGather = dirToGather(path.join(__dirname, './lib'), '.')
Object.assign(exports, libGather.common)

exports.chalk = require('chalk')
exports.execa = require('execa')
exports.semver = require('semver')
exports.minimist = require('minimist')
exports.os = require('os');

Object.defineProperty(exports, 'installedBrowsers', {
    enumerable: true,
    get () {
        return exports.getInstalledBrowsers()
    }
})