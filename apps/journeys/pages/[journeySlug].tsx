import { ReactElement } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { gql } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui'
import Head from 'next/head'
import { BLOCK_FIELDS, transformer } from '@core/journeys/ui'
import { Conductor } from '../src/components/Conductor'
import client from '../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../__generated__/GetJourney'
import { GetJourneySlugs } from '../__generated__/GetJourneySlugs'

interface JourneyPageProps {
  journey: Journey
}

function JourneyPage({ journey }: JourneyPageProps): ReactElement {
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
      <ThemeProvider
        themeName={journey.themeName}
        themeMode={journey.themeMode}
      >
        {console.log(journey)}
        {journey.blocks != null && (
          <Conductor blocks={transformer(journey.blocks)} />
        )}
      </ThemeProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps<JourneyPageProps> = async ({
  params
}) => {
  const { data } = await client.query<GetJourney>({
    query: gql`
      ${BLOCK_FIELDS}
      query GetJourney($id: ID!) {
        # slug might have to be string
        journey(id: $id, idType: slug) {
          id
          themeName
          themeMode
          title
          description
          primaryImageBlock {
            src
          }
          blocks {
            ...BlockFields
          }
        }
      }
    `,
    variables: {
      id: params?.journeySlug
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
      },
      revalidate: 60
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await client.query<GetJourneySlugs>({
    query: gql`
      query GetJourneySlugs {
        journeys(status: published) {
          slug
        }
      }
    `
  })

  const paths = data.journeys.map(({ slug: journeySlug }) => ({
    params: { journeySlug }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export default JourneyPage
