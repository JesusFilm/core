import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import client from '../../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { Typography, Box } from '@mui/material'
import JourneysAppBar from '../../src/components/JourneysAppBar'

interface SingleJourneyPageProps {
  journey: Journey
}

function SingleJourneyPage({ journey }: SingleJourneyPageProps): ReactElement {
  return (
    <>
      <Head>
        <title>{journey.title}</title>
        <meta property="og:title" content={journey.title} />
        {journey.description != null && (
          <meta name="description" content={journey.description} />
        )}
      </Head>
      <JourneysAppBar journey={journey} />
      <Box sx={{ m: 10 }}>
        <Typography variant={'h2'} sx={{ mb: 4 }}>
          Single Journey Page
        </Typography>
        <Typography variant={'h6'}>{journey.title}</Typography>
        <Typography variant={'h6'}>{journey.status}</Typography>
        <Typography variant={'h6'}>created: {journey.createdAt}</Typography>
        <Typography variant={'h6'}>published: {journey.publishedAt}</Typography>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<SingleJourneyPageProps> =
  async (context) => {
    const { data } = await client.query<GetJourney>({
      query: gql`
        query GetJourney($id: ID!) {
          journey(id: $id, idType: slug) {
            id
            title
            description
            status
            createdAt
            publishedAt
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

// query GetJourney($id: ID!) {
//   journey(id: $id, idType: slug) {
//     id
//     title
//     description
//     primaryImageBlock {
//       src
//     }
//     userJourneys {
//       user {
//         id
//         firstName
//         lastName
//         email
//         role
//         imageUrl
//       }
//     }
//   }
// }
