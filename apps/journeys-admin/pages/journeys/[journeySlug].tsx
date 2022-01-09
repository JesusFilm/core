import { ReactElement, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import client from '../../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey,
  GetJourney_journey_userJourneys as UserJourneys
} from '../../__generated__/GetJourney'
import { Typography, Box } from '@mui/material'
import { useFirebase } from '../../src/libs/firebaseClient/'
import { useRouter } from 'next/router'
import {
  InviteUserModal,
  INVITE_USER_MODAL_FIELDS
} from '../../src/components/InviteUserModal'
import { ThemeProvider } from '../../src/components/ThemeProvider'
import { JourneysAppBar } from '../../src/components/JourneysAppBar'

interface SingleJourneyPageProps {
  journey: Journey
}

function SingleJourneyPage({ journey }: SingleJourneyPageProps): ReactElement {
  const { user, loading } = useFirebase()
  const router = useRouter()
  const [currentUsersJourney, setCurrentUsersJourney] =
    useState<UserJourneys | null>()

  useEffect(() => {
    // prevent user from accessing this page if they are not logged in
    if (loading === false && user == null) {
      void router.push('/')
    }
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
      <ThemeProvider>
        <JourneysAppBar variant="view" />
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
      </ThemeProvider>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  SingleJourneyPageProps
> = async (context) => {
  const { data } = await client.query<GetJourney>({
    query: gql`
      ${INVITE_USER_MODAL_FIELDS}
      query GetJourney($id: ID!) {
        journey(id: $id, idType: slug) {
          id
          title
          description
          status
          createdAt
          publishedAt
          slug
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
    `,
    variables: {
      id: context.query.journeySlug
    }
  })

  if (data.journey === null) {
    return {
      notFound: true
    }
  } else {
    return {
      props: {
        journey: data.journey
      }
    }
  }
}

export default SingleJourneyPage
