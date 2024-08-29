import { registerApolloClient } from '@apollo/experimental-nextjs-app-support'

import { auth } from '../../auth'
import { VideoSession } from '../../auth.config'

import { makeClient } from './makeClient'

export const { getClient: getApolloClient, query } = registerApolloClient(
  async () => {
    const session = await auth()
    return makeClient({
      headers: { Authorization: (session as VideoSession)?.user?.token ?? '' }
    })
  }
)
