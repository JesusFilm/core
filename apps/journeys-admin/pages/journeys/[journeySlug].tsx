import { ReactElement, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import { BLOCK_FIELDS } from '@core/journeys/ui'
import { useRouter } from 'next/router'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import {
  GetJourney,
  GetJourney_journey as Journey,
  GetJourney_journey_userJourneys as UserJourneys
} from '../../__generated__/GetJourney'
import { JourneyProvider } from '../../src/components/JourneyView/Context'
import { JourneyView } from '../../src/components/JourneyView'
import client, {
  addApolloState,
  initializeApollo
} from '../../src/libs/apolloClient'
import {
  InviteUserModal,
  INVITE_USER_MODAL_FIELDS
} from '../../src/components/InviteUserModal'

const GET_JOURNEY = gql`
  ${BLOCK_FIELDS}
  ${INVITE_USER_MODAL_FIELDS}
  query GetJourney($id: ID!) {
    journey(id: $id, idType: slug) {
      id
      slug
      title
      description
      status
      locale
      createdAt
      publishedAt
      blocks {
        ...BlockFields
      }
      primaryImageBlock {
        src
      }
      userJourneys {
        id
        userId
        journeyId
        role
        user {
          ...InviteUserModalFields
        }
      }
    }
  }
`

function JourneySlugPage(): ReactElement {
  const router = useRouter()

  useEffect(() => {
    if (
      user == null ||
      journey.userJourneys == null ||
      journey.userJourneys.length === 0
    ) {
      setCurrentUsersJourney(null)
    } else {
      const userJourneys = journey.userJourneys?.filter(
        (userJourney) => userJourney.userId === user.uid
      )
      if (userJourneys.length > 0) {
        setCurrentUsersJourney(userJourneys[0])
      }
    }
  }, [user, router, loading, journey.userJourneys])

  return (
    <>
      <Head>
        <title>{journey.title}</title>
        <meta property="og:title" content={journey.title} />
        {journey.description != null && (
          <meta name="description" content={journey.description} />
        )}
      </Head>
      <JourneyProvider value={journey}>
        <JourneyView />
        <Box sx={{ m: 10 }}>
          <Typography variant={'h2'}>{journey.title}</Typography>
          {currentUsersJourney?.role === 'inviteRequested' ? (
            <Typography variant={'h6'}>Your invite is pending</Typography>
          ) : currentUsersJourney?.role === 'editor' ? (
            <Typography variant="h6">You are an editor</Typography>
          ) : currentUsersJourney !== null ? (
            <InviteUserModal journey={journey} />
          ) : (
            'Sorry, you have no access to the requested journey.'
          )}
        </Box>
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, query }) => {
  const token = (await AuthUser.getIdToken()) ?? undefined
  const apolloClient = initializeApollo({ token })
  await apolloClient.query<GetJourney>({
    query: GET_JOURNEY,
    variables: {
      id: query.journeySlug
    }
  })

  return addApolloState(apolloClient, {
    props: {}
  })
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneySlugPage)
