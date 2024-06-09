import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement, useMemo } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourney,
  GetJourneyVariables,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { StepFields } from '../../../__generated__/StepFields'
import i18nConfig from '../../../next-i18next.config'
import { EmbeddedPreview } from '../../../src/components/EmbeddedPreview'
import { createApolloClient } from '../../../src/libs/apolloClient'

interface HostJourneyEmbedPageProps {
  host: string
  journey: Journey
  locale: string
  rtl: boolean
}

function HostJourneyEmbedPage({
  host,
  journey,
  locale,
  rtl
}: HostJourneyEmbedPageProps): ReactElement {
  const blocks = useMemo(() => {
    return transformer(journey.blocks ?? [])
  }, [journey])

  const theme =
    blocks.length > 0
      ? getStepTheme(blocks[0] as TreeBlock<StepFields>, journey)
      : { themeName: journey.themeName, themeMode: journey.themeMode }
  return (
    <>
      <NextSeo
        nofollow
        noindex
        title={journey.seoTitle ?? undefined}
        description={journey.seoDescription ?? undefined}
        openGraph={{
          type: 'website',
          title: journey.seoTitle ?? undefined,
          url: `https://${host}/${journey.slug}`,
          description: journey.seoDescription ?? undefined,
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
      />
      <style jsx global>{`
        body {
          background: transparent !important;
        }
      `}</style>
      <JourneyProvider value={{ journey, variant: 'embed' }}>
        <ThemeProvider {...theme} rtl={rtl} locale={locale}>
          <EmbeddedPreview blocks={blocks} />
        </ThemeProvider>
      </JourneyProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps<HostJourneyEmbedPageProps> = async (
  context
) => {
  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney, GetJourneyVariables>({
      query: GET_JOURNEY,
      variables: {
        id: context.params?.journeySlug?.toString() ?? '',
        options: {
          hostname: context.params?.hostname?.toString() ?? ''
        }
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)
    return {
      props: {
        host: context.params?.host?.toString() ?? '',
        ...(await serverSideTranslations(
          context.locale ?? 'en',
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
        notFound: true,
        revalidate: 1
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

export default HostJourneyEmbedPage
