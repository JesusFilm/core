import { ReactElement } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { gql } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui'
import { transformer, JourneyProvider, JOURNEY_FIELDS } from '@core/journeys/ui'
import { NextSeo } from 'next-seo'
import { Conductor } from '../src/components/Conductor'
import { createApolloClient } from '../src/libs/client'
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
          type: 'website',
          title: journey.seoTitle ?? journey.title,
          url: `https://${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }/${journey.slug}`,
          description:
            journey.seoDescription ?? journey.description ?? undefined,
          images:
            journey.primaryImageBlock?.src != null
              ? [
                  {
                    url: journey.primaryImageBlock.src,
                    width: journey.primaryImageBlock.width,
                    height: journey.primaryImageBlock.height,
                    alt: journey.primaryImageBlock.alt,
                    type: 'image/jpeg'
                  }
                ]
              : []
        }}
        facebook={
          process.env.NEXT_PUBLIC_FACEBOOK_APP_ID != null
            ? {
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
              }
            : undefined
        }
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
      <JourneyProvider value={journey}>
        <ThemeProvider
          themeName={journey.themeName}
          themeMode={journey.themeMode}
        >
          {journey.blocks != null && (
            <Conductor blocks={transformer(journey.blocks)} />
          )}
        </ThemeProvider>
      </JourneyProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps<JourneyPageProps> = async ({
  params
}) => {
  const client = createApolloClient()
  const { data } = await client.query<GetJourney>({
    query: gql`
      ${JOURNEY_FIELDS}
      query GetJourney($id: ID!) {
        journey(id: $id, idType: slug) {
          ...JourneyFields
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
  const client = createApolloClient()
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
