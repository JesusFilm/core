import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { SingleJourney } from '../../src/components/SingleJourney'
import { BlockFields_StepBlock as StepBlock } from '../../__generated__/BlockFields'
import client from '../../src/libs/client'
import CardOverview from '../../src/components/SingleJourney/CardOverview'
import { transformer, BLOCK_FIELDS, TreeBlock } from '@core/journeys/ui'

interface SingleJourneyPageProps {
  journey: Journey
}

function SingleJourneyPage({ journey }: SingleJourneyPageProps): ReactElement {
  const blocks = journey.blocks != null ? transformer(journey.blocks) : []
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
      <CardOverview
        slug={journey.slug}
        blocks={blocks as Array<TreeBlock<StepBlock>>}
      />
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
