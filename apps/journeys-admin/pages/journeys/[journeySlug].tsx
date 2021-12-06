import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql, useQuery } from '@apollo/client'
import Head from 'next/head'
import client from '../../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { Typography, Box } from '@mui/material'
import JourneysAppBar from '../../src/components/JourneysAppBar'

export const GET_JOURNEY = gql`
  query GetJourney($id: ID!) {
    journey(id: $id, idType: slug) {
      id
      title
      description
      slug
      status
      locale
      createdAt
      publishedAt
    }
  }
`

interface SingleJourneyPageProps {
  journey: Journey
}

function SingleJourneyPage({ journey }: SingleJourneyPageProps): ReactElement {
  const { data } = useQuery(GET_JOURNEY, {
    variables: { id: journey.slug }
  })

  const updatedJourney = data !== undefined ? data.journey : journey

  console.log('single page', data, journey)
  return (
    <>
      <Head>
        <title>{updatedJourney.title}</title>
        <meta property="og:title" content={journey.title} />
        {journey.description != null && (
          <meta name="description" content={journey.description} />
        )}
      </Head>
      <JourneysAppBar journey={updatedJourney} />
      <Box sx={{ m: 10 }}>
        <Typography variant={'h6'}>{updatedJourney.title}</Typography>
        <Typography variant={'h6'}>{updatedJourney.description}</Typography>
        <Typography variant={'h6'}>{updatedJourney.status}</Typography>
        <Typography variant={'h6'}>
          created: {updatedJourney.createdAt}
        </Typography>
        <Typography variant={'h6'}>
          published: {updatedJourney.publishedAt}
        </Typography>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<SingleJourneyPageProps> =
  async (context) => {
    const { data } = await client.query<GetJourney>({
      query: GET_JOURNEY,
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
