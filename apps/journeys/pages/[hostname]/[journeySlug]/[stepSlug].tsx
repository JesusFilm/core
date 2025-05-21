import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import {
  GetJourney,
  GetJourneyVariables,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import i18nConfig from '../../../next-i18next.config'
import { JourneyPageWrapper } from '../../../src/components/JourneyPageWrapper'
import { WebView } from '../../../src/components/WebView'
import { createApolloClient } from '../../../src/libs/apolloClient'

interface StepPageProps {
  journey: Journey
  locale: string
  rtl: boolean
}

function HostStepPage({ journey, locale, rtl }: StepPageProps): ReactElement {
  const router = useRouter()
  const blocks = transformer(journey.blocks ?? [])
  const stepSlug = router.query.stepSlug as string

  const stepBlock = blocks.find(
    (block) =>
      block.__typename === 'StepBlock' &&
      (block.slug === stepSlug || block.id === stepSlug)
  )

  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/json+oembed"
          href={`https://${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }/api/oembed?url=https%3A%2F%2F${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }%2F${journey.slug}&format=json`}
          title={journey.seoTitle ?? undefined}
        />
      </Head>
      <NextSeo
        nofollow
        noindex
        title={journey.seoTitle ?? undefined}
        description={journey.seoDescription ?? undefined}
        openGraph={{
          type: 'website',
          title: journey.seoTitle ?? undefined,
          url: `https://${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }/${journey.slug}`,
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
      <JourneyPageWrapper journey={journey} rtl={rtl} locale={locale}>
        <WebView
          blocks={blocks}
          stepBlock={stepBlock as TreeBlock<StepBlock>}
        />
      </JourneyPageWrapper>
    </>
  )
}

export const getStaticProps: GetStaticProps<StepPageProps> = async (
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

    const stepBlock = data.journey?.blocks?.find(
      (block) =>
        block.__typename === 'StepBlock' &&
        (block.slug === context.params?.stepSlug ||
          block.id === context.params?.stepSlug)
    )

    if (stepBlock == null)
      return {
        redirect: {
          destination: `/${data.journey.slug}`,
          permanent: false
        },
        revalidate: 1
      }

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

export default HostStepPage
