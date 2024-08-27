import { registerApolloClient } from '@apollo/experimental-nextjs-app-support'

import { makeClient } from './makeClient'

export const { getClient: getApolloClient, query } = registerApolloClient(() =>
  makeClient()
)
