import { ReactElement, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import client from '../../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { Typography, Box } from '@mui/material'
import { UseFirebase } from '../../src/libs/firebaseClient/'
import { useRouter } from 'next/router'
import {
  InviteUserModal,
  INVITE_USER_MODAL_FIELDS
} from '../../src/components/InviteUserModal'

interface SingleJourneyPageProps {
  journey: Journey
}

function SingleJourneyPage({ journey }: SingleJourneyPageProps): ReactElement {
  const { user, loading } = UseFirebase()
  const router = useRouter()
  const [currentUsersJourney, setCurrentUsersJourney] = useState(null)

  useEffect(() => {
    // prevent user from accessing this page if they are not logged in
    if (loading === false && user == null) {
      void router.push('/')
    }
    if (
      user == null ||
      journey.usersJourneys == null ||
      journey.usersJourneys.length === 0
    ) {
      setCurrentUsersJourney(null)
    } else {
      const userJourneys = journey.usersJourneys?.filter(
        (userJourney) => userJourney.userId === user.uid
      )
      if (userJourneys.length > 0) {
        setCurrentUsersJourney(userJourneys[0])
      }
    }
  }, [user, router, loading, journey.usersJourneys])

  return (
    <>
      <Head>
        <title>{journey.title}</title>
        <meta property="og:title" content={journey.title} />
        {journey.description != null && (
          <meta name="description" content={journey.description} />
        )}
        {journey.primaryImageBlock != null && (
          <meta property="og:image" content={journey.primaryImageBlock.src} />
        )}
      </Head>
      <Box sx={{ m: 10 }}>
        <Typography variant={'h2'}>{journey.title}</Typography>
        <Typography variant={'h6'}>{journey.status}</Typography>
        <Typography variant={'h6'}>Created: {journey.createdAt}</Typography>
        <Typography variant={'h6'}>Published: {journey.publishedAt}</Typography>
        {console.log(journey)}
        {currentUsersJourney?.role === 'inviteRequested' ? (
          'Your invite is pending'
        ) : currentUsersJourney?.role === 'editor' ? (
          'You can edit'
        ) : currentUsersJourney !== null ? (
          <InviteUserModal
            usersJourneys={
              journey.usersJourneys != null ? journey.usersJourneys : undefined
            }
            journey={journey}
          />
        ) : (
          "You don't have permission to do things"
        )}
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<SingleJourneyPageProps> =
  async (context) => {
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
            usersJourneys {
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
