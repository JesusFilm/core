import { ReactElement, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { gql, useMutation } from '@apollo/client'
import Head from 'next/head'
import { Typography, Box, Button } from '@mui/material'
import { useRouter } from 'next/router'
import client from '../../../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { useFirebase } from '../../../src/libs/firebaseClient'
import { UserJourneyRequest } from '../../../__generated__/UserJourneyRequest'
import { INVITE_USER_MODAL_FIELDS } from '../../../src/components/InviteUserModal'

interface JourneyInvitePageProps {
  journey: Journey
}

export const USER_JOURNEY_REQUEST = gql`
  mutation UserJourneyRequest($journeyId: ID!) {
    userJourneyRequest(journeyId: $journeyId) {
      userId
      journeyId
      role
    }
  }
`

function JourneyInvitePage({ journey }: JourneyInvitePageProps): ReactElement {
  const { user, loading } = useFirebase()
  const router = useRouter()
  const [userJourneyRequest] =
    useMutation<UserJourneyRequest>(USER_JOURNEY_REQUEST)

  if (user == null) {
    try {
      localStorage.setItem('pendingInviteRequest', journey.id)
    } catch (e) {
      console.log('on server')
    }
  }

  const handleClick = (journeyId: string): void => {
    void userJourneyRequest({
      variables: { journeyId }
    })

    localStorage.removeItem('pendingInviteRequest')
    // TODO: - add a success message or redirect to a success page
    void router.push(`/journeys`)
  }

  useEffect(() => {
    // prevent user from accessing this page if they are not logged in
    if (loading === false && user == null) {
      void router.push('/')
    }
  }, [user, router, loading])

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
        <Typography variant={'h6'}>
          You need access for {journey.title}
        </Typography>
        <Button variant={'contained'} onClick={() => handleClick(journey.id)}>
          Request Access
        </Button>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<JourneyInvitePageProps> =
  async (context) => {
    const { data } = await client.query<GetJourney>({
      query: gql`
        ${INVITE_USER_MODAL_FIELDS}
        query GetJourneyForRequest($id: ID!) {
          journey(id: $id, idType: slug) {
            id
            title
            description
            createdAt
            primaryImageBlock {
              src
            }
            userJourneys {
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

export default JourneyInvitePage
