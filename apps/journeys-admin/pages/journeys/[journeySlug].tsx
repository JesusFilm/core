import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql, useQuery } from '@apollo/client'
import Head from 'next/head'
import client from '../../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'

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
  // const { data } = useQuery(GET_JOURNEY, {
  //   variables: { id: journey.slug }
  // })

  // const updatedJourney = data !== undefined ? data.journey : journey
  const updatedJourney = journey

  return (
    <>
      <Head>
        <title>{updatedJourney.title}</title>
        <meta property="og:title" content={journey.title} />
        {journey.description != null && (
          <meta name="description" content={journey.description} />
        )}
      </Head>
      <SingleJourneyPage journey={updatedJourney} />
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
