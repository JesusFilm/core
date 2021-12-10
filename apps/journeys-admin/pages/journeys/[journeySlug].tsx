import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import client from '../../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { SingleJourney } from '../../src/components/SingleJourney'

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
      <SingleJourney journey={journey} />
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
            slug
            status
            locale
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
