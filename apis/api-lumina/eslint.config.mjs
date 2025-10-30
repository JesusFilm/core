import yogaConfig from '../../libs/shared/eslint/yogaWithReactEmail.mjs'

export default [
  ...yogaConfig,
  {
    ignores: ['apis/api-lumina/webpack.config.js']
  }
]
