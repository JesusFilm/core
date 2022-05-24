import { ReactElement } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { gql } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui'
import { transformer, JourneyProvider, JOURNEY_FIELDS } from '@core/journeys/ui'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { Conductor } from '../src/components/Conductor'
import { apolloClient } from '../src/libs/apolloClient'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../__generated__/GetJourney'
import { GetJourneySlugs } from '../__generated__/GetJourneySlugs'
import i18nConfig from '../next-i18next.config'

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
      <JourneyProvider value={{ journey }}>
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

export const getStaticProps: GetStaticProps<JourneyPageProps> = async (
  context
) => {
  const { data } = await apolloClient.query<GetJourney>({
    query: gql`
      ${JOURNEY_FIELDS}
      query GetJourney($id: ID!) {
        journey(id: $id, idType: slug) {
          ...JourneyFields
        }
      }
    `,
    variables: {
      id: context.params?.journeySlug
    }
  })

  if (data.journey === null) {
    return {
      props: {
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys'],
          i18nConfig
        ))
      },
      notFound: true,
      revalidate: 60
    }
  } else {
    return {
      props: {
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys'],
          i18nConfig
        )),
        journey: data.journey
      },
      revalidate: 60
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await apolloClient.query<GetJourneySlugs>({
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
