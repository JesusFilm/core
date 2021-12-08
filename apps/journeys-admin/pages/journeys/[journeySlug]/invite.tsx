import { ReactElement, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import client from '../../../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { Typography, Box, Button } from '@mui/material'
import { UseFirebase } from '../../../src/libs/firebaseClient'
import { useRouter } from 'next/router'
import { INVITE_USER_MODAL_FIELDS } from '../../../src/components/InviteUserModal'

interface JourneyInvitePageProps {
  journey: Journey
}

function JourneyInvitePage({ journey }: JourneyInvitePageProps): ReactElement {
  const { user, loading } = UseFirebase()
  const router = useRouter()

  if (user == null) {
    try {
      localStorage.setItem('pendingInviteRequest', journey.id)
    } catch (e) {
      console.log('on server')
    }
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
          You have been invited to {journey.title}
        </Typography>
        <Button>Accept invite</Button>
      </Box>
    </>
  )
}

// export const getServerSideProps: GetServerSideProps<JourneyInvitePageProps> =
//   async (context) => {
//     const { data } = await client.query<GetJourney>({
//       query: gql`
//         ${INVITE_USER_MODAL_FIELDS}
//         query GetJourney($id: ID!) {
//           journey(id: $id, idType: slug) {
//             id
//             title
//             description
//             status
//             createdAt
//             publishedAt
//             slug
//             primaryImageBlock {
//               src
//             }
//             usersJourneys {
//               userId
//               journeyId
//               role
//               user {
//                 ...InviteUserModalFields
//               }
//             }
//           }
//         }
//       `,
//       variables: {
//         id: context.query.journeySlug
//       }
//     })

//     if (data.journey === null) {
//       return {
//         notFound: true
//       }
//     } else {
//       return {
//         props: {
//           journey: data.journey
//         }
//       }
//     }
//   }

export default JourneyInvitePage
