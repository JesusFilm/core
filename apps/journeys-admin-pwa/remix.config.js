const { createWatchPaths } = require('@nx/remix')

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const config = {
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  watchPaths: () => createWatchPaths(__dirname)
}

module.exports = config
