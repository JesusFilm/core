import commonConfig from './common.mjs'

const apiConfig = [
  ...commonConfig,
  {
    ignores: ['**/webpack.config.js']
  }
]

export default apiConfig
