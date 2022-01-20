import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import { gql, useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { addApolloState, initializeApollo } from '../src/libs/apolloClient'
import { GetJourneys } from '../__generated__/GetJourneys'
import { JourneyList } from '../src/components/JourneyList'
import { AppBar } from '../src/components/AppBar'

const GET_JOURNEYS = gql`
  query GetJourneys {
    journeys: adminJourneys {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      locale
      status
      userJourneys {
        id
        userId
        journeyId
        user {
          __typename
          id
          firstName
          lastName
          email
          imageUrl
        }
      }
    }
  }
`

function IndexPage(): ReactElement {
  const { signOut } = useAuthUser()
  const { data } = useQuery<GetJourneys>(GET_JOURNEYS)

  return (
    <>
      <AppBar title="Journeys" />
      <Container sx={{ mb: 10 }}>
        {data?.journeys != null && <JourneyList journeys={data.journeys} />}
        <Button variant="contained" onClick={signOut}>
          Sign Out
        </Button>
      </Container>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser }) => {
  const apolloClient = initializeApollo({
    token: (await AuthUser.getIdToken()) ?? ''
  })
  await apolloClient.query({
    query: GET_JOURNEYS
  })

  return addApolloState(apolloClient, {
    props: {}
  })
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IndexPage)
