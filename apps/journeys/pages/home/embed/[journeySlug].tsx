import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement, useMemo } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import {
  GetJourney,
  GetJourneyVariables,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { StepFields } from '../../../__generated__/StepFields'
import i18nConfig from '../../../next-i18next.config'
import { EmbeddedPreview } from '../../../src/components/EmbeddedPreview'
import { JourneyPageWrapper } from '../../../src/components/JourneyPageWrapper'
import { createApolloClient } from '../../../src/libs/apolloClient'

interface JourneyPageProps {
  journey: Journey
  locale: string
  rtl: boolean
}

function JourneyPage({ journey, locale, rtl }: JourneyPageProps): ReactElement {
  const blocks = useMemo(() => {
    return transformer(journey.blocks ?? [])
  }, [journey])
  const { query } = useRouter()

  const theme =
    blocks.length > 0
      ? getStepTheme(blocks[0] as TreeBlock<StepFields>, journey)
      : { themeName: journey.themeName, themeMode: journey.themeMode }

  return (
    <>
      <NextSeo
        title={journey.title}
        nofollow
        noindex
        description={journey.description ?? undefined}
        openGraph={{
          type: 'website',
          title: journey.seoTitle ?? journey.displayTitle ?? '',
          url: `https://${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }/embed/${journey.slug}`,
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
      <style jsx global>{`
        body {
          background: transparent !important;
        }
      `}</style>
      <JourneyPageWrapper
        journey={journey}
        variant="embed"
        theme={theme}
        rtl={rtl}
        locale={locale}
      >
        <EmbeddedPreview disableFullscreen={query?.expand === 'false'} />
      </JourneyPageWrapper>
    </>
  )
}

export const getStaticProps: GetStaticProps<JourneyPageProps> = async (
  context
) => {
  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney, GetJourneyVariables>({
      query: GET_JOURNEY,
      variables: {
        id: context.params?.journeySlug?.toString() ?? '',
        idType: IdType.slug,
        options: {
          embedded: true
        }
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)

    return {
      props: {
        ...(await serverSideTranslations(
          locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        journey: data.journey,
        locale,
        rtl
      },
      revalidate: 60
    }
  } catch (e) {
    if (e.message === 'journey not found') {
      return {
        props: {
          ...(await serverSideTranslations(
            context.locale ?? 'en',
            ['apps-journeys', 'libs-journeys-ui'],
            i18nConfig
          ))
        },
        notFound: true
      }
    }
    throw e
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default JourneyPage
