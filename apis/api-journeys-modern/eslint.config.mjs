import yogaConfig from '../../libs/shared/eslint/yogaWithReactEmail.mjs'

export default [
  ...yogaConfig,
  {
    ignores: ['apis/api-journeys-modern/webpack.config.js']
  }
]
