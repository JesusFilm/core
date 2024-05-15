import { gql, useMutation, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { ReactElement, useEffect } from 'react'

import { Nexuses } from '../__generated__/Nexuses'
import { NEXUS_CREATE } from '../src/components/CreateNexusModal'
import { Loader } from '../src/components/Loader'
import { PageWrapper } from '../src/components/PageWrapper'

export const GET_NEXUSES = gql`
  query Nexuses($where: NexusFilter) {
    nexuses(where: $where) {
      id
      name
    }
  }
`

function IndexPage(): ReactElement {
  const router = useRouter()
  const user = useUser()
  const { data } = useQuery<Nexuses>(GET_NEXUSES, {
    variables: {
      where: {}
    }
  })
  const [nexusCreate] = useMutation(NEXUS_CREATE)

  const redirectToDashboard = (nexusId: string): void => {
    localStorage.setItem('nexusId', nexusId)
    void router.push('/channels')
  }

  useEffect(() => {
    if (data !== undefined) {
      if (data.nexuses.length === 0) {
        void nexusCreate({
          variables: {
            input: {
              name: 'Nexus',
              description: 'This is a nexus app'
            }
          },
          refetchQueries: [GET_NEXUSES]
        })
      } else {
        redirectToDashboard(data.nexuses?.[0]?.id)
      }
    }
  }, [data])

  return <PageWrapper user={user} />
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {
  const token = await user?.getIdToken()

  return {
    props: {
      token
    }
  }
})

export default withUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: Loader
})(IndexPage)
