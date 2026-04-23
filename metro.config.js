const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// package.json の exports フィールドを無効化し、browser/main（CJS）を優先
config.resolver.unstable_enablePackageExports = false;
config.resolver.resolverMainFields = ['browser', 'main', 'react-native'];

module.exports = config;
