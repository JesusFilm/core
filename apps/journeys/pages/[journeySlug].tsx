import { ReactElement } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { gql } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui'
import { BLOCK_FIELDS, transformer } from '@core/journeys/ui'
import { NextSeo } from 'next-seo'
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
      <NextSeo
        title={journey.title}
        description={journey.description ?? undefined}
        openGraph={{
          title: journey.title,
          description: journey.description ?? undefined,
          images:
            journey.primaryImageBlock?.src != null
              ? [{ url: journey.primaryImageBlock.src }]
              : []
        }}
      />
      <ThemeProvider
        themeName={journey.themeName}
        themeMode={journey.themeMode}
      >
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
      notFound: true,
      revalidate: 60
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
        journeys {
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
