import { ReactElement, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import { BLOCK_FIELDS } from '@core/journeys/ui'
import { useRouter } from 'next/router'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import {
  GetJourney,
  GetJourney_adminJourney as Journey,
  GetJourney_adminJourney_userJourneys as UserJourneys
} from '../../__generated__/GetJourney'
import { JourneyProvider } from '../../src/components/JourneyView/Context'
import { JourneyView } from '../../src/components/JourneyView'
import client from '../../src/libs/client'
import { useFirebase } from '../../src/libs/firebaseClient'
import {
  InviteUserModal,
  INVITE_USER_MODAL_FIELDS
} from '../../src/components/InviteUserModal'

interface JourneyViewPageProps {
  journey: Journey
}

function JourneyViewPage({ journey }: JourneyViewPageProps): ReactElement {
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

export const getServerSideProps: GetServerSideProps<JourneyViewPageProps> =
  async (context) => {
    const { data } = await client.query<GetJourney>({
      query: gql`
        ${BLOCK_FIELDS}
        ${INVITE_USER_MODAL_FIELDS}
        query GetJourney($id: ID!) {
          adminJourney(id: $id, idType: slug) {
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
      `,
      variables: {
        id: context.query.journeySlug
      }
    })

    if (data.adminJourney === null) {
      return {
        notFound: true
      }
    } else {
      return {
        props: {
          journey: data.adminJourney
        }
      }
    }
  }

export default JourneyViewPage
