import yogaConfig from '../../libs/shared/eslint/yogaWithReactEmail.mjs'

export default [
  ...yogaConfig,
  {
    ignores: ['libs/yoga/vitest.config.mts']
  }
]
