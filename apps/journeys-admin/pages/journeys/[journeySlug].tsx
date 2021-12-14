import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { SingleJourney, JourneyProvider } from '../../src/components'

import client from '../../src/libs/client'

import { BLOCK_FIELDS } from '@core/journeys/ui'

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
      <JourneyProvider value={journey}>
        <SingleJourney />
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<SingleJourneyPageProps> =
  async (context) => {
    const { data } = await client.query<GetJourney>({
      query: gql`
        ${BLOCK_FIELDS}
        query GetJourney($id: ID!) {
          journey(id: $id, idType: slug) {
            id
            slug
            title
            description
            slug
            status
            locale
            createdAt
            publishedAt
            blocks {
              ...BlockFields
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
