import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import { Typography, Box } from '@mui/material'

import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { BlockFields_StepBlock as StepBlock } from '../../__generated__/BlockFields'
import client from '../../src/libs/client'
import { JourneysAppBar } from '../../src/components/JourneysAppBar'
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
      <JourneysAppBar variant={'view'} />
      <Box sx={{ m: 10 }}>
        <Typography variant={'h2'} sx={{ mb: 4 }}>
          Single Journey Page
        </Typography>
        <Typography variant={'h6'}>{journey.title}</Typography>
        <Typography variant={'h6'}>{journey.status}</Typography>
        <Typography variant={'h6'}>created: {journey.createdAt}</Typography>
        <Typography variant={'h6'}>published: {journey.publishedAt}</Typography>

        <CardOverview
          slug={journey.slug}
          blocks={blocks as Array<TreeBlock<StepBlock>>}
        />
      </Box>
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
            status
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
