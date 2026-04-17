import yogaConfig from '../../libs/shared/eslint/yogaWithReactEmail.mjs'

export default [
  ...yogaConfig,
  {
    ignores: [
      'apis/api-users/**/*.stories.{ts,tsx,js,jsx}',
      'apis/api-users/src/lib/apiUsersConfig/**'
    ]
  }
]
