import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourney,
  GetJourneyVariables,
  GetJourney_journey as JourneyFields
} from '../../__generated__/GetJourney'
import {
  GetJourneysSummary,
  GetJourneysSummaryVariables,
  GetJourneysSummary_journeys as Journey
} from '../../__generated__/GetJourneysSummary'
import { IdType, ThemeMode, ThemeName } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import logo from '../../public/logo.svg'
import { createApolloClient } from '../../src/libs/apolloClient'
import JourneysPage, { GET_JOURNEYS } from '../home'

import HostJourneyPage from './[journeySlug]'

interface HostJourneysPageProps {
  host?: string
  journeys?: Journey[]
}

function getHostJourneyPage(
  journey: JourneyFields,
  host: string | undefined
): ReactElement {
  const { rtl, locale } = getJourneyRTL(journey)
  return (
    <HostJourneyPage
      journey={journey}
      host={host ?? ''}
      locale={locale}
      rtl={rtl}
    />
  )
}

function HostJourneysPage({
  journeys,
  host
}: HostJourneysPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys')

  return (
    <>
      {journeys == null ? (
        <>
          <NextSeo nofollow noindex />
          <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
            <Container maxWidth="xxl">
              <Stack spacing={8} py={8}>
                <Image
                  src={logo}
                  alt="Next Steps"
                  height={68}
                  width={152}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    alignSelf: 'center'
                  }}
                />
                <Typography sx={{ textAlign: 'center' }}>
                  {t("There's nothing here, yet.")}
                </Typography>
              </Stack>
            </Container>
          </ThemeProvider>
        </>
      ) : journeys.length === 1 ? (
        getHostJourneyPage(journeys[0] as JourneyFields, host)
      ) : (
        <JourneysPage journeys={journeys} />
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps<HostJourneysPageProps> = async (
  context
) => {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<
    GetJourneysSummary,
    GetJourneysSummaryVariables
  >({
    query: GET_JOURNEYS,
    variables: {
      options: {
        hostname: context.params?.hostname as string,
        journeyCollection: true
      }
    }
  })

  if (data.journeys === null) {
    return {
      props: {
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        ))
      },
      journeys: data.journeys,
      notFound: true,
      revalidate: 1
    }
  } else if (data.journeys.length === 1) {
    try {
      const { data: journeyData } = await apolloClient.query<
        GetJourney,
        GetJourneyVariables
      >({
        query: GET_JOURNEY,
        variables: {
          id: data.journeys[0].slug.toString(),
          idType: IdType.slug,
          options: {
            hostname: context.params?.hostname?.toString() ?? ''
          }
        }
      })
      return {
        props: {
          host: context.params?.host?.toString() ?? '',
          ...(await serverSideTranslations(
            context.locale ?? 'en',
            ['apps-journeys', 'libs-journeys-ui'],
            i18nConfig
          )),
          journeys: [{ ...journeyData.journey }]
        },
        revalidate: 60
      }
    } catch {
      return {
        props: {
          ...(await serverSideTranslations(
            context.locale ?? 'en',
            ['apps-journeys', 'libs-journeys-ui'],
            i18nConfig
          )),
          journeys: data.journeys
        },
        notFound: true,
        revalidate: 1
      }
    }
  } else {
    return {
      props: {
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        journeys: data.journeys
      },
      revalidate: 60
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default HostJourneysPage
