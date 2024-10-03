import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { createWatchPaths } from '@nx/remix'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  watchPaths: () => createWatchPaths(__dirname)
}
