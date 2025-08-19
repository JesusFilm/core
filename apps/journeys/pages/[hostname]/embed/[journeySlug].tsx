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
  const { query } = useRouter()

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
      <JourneyPageWrapper
        journey={journey}
        theme={theme}
        variant="embed"
        rtl={rtl}
        locale={locale}
      >
        <EmbeddedPreview disableFullscreen={query?.expand === 'false'} />
      </JourneyPageWrapper>
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
        idType: IdType.slug,
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
