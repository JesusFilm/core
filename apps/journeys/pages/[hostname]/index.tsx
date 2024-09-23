import { gql } from '@apollo/client'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourneysFields,
  GetJourneysFieldsVariables,
  GetJourneysFields_journeys as Journey
} from '../../__generated__/GetJourneysFields'
import { ThemeMode, ThemeName } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import logo from '../../public/logo.svg'
import { createApolloClient } from '../../src/libs/apolloClient'
import JourneysPage from '../home'

import HostJourneyPage from './[journeySlug]'

export enum PageType {
  DefaultJourney = 'DefaultJourney',
  JourneyCollection = 'JourneyCollection',
  NotFound = 'NotFound'
}

interface NotFoundPageProps {
  pageType: PageType.NotFound
}

interface HostJourneysPageProps {
  pageType: PageType.JourneyCollection
  journeys: Journey[]
}

interface DefaulJourneytHostPageProps {
  pageType: PageType.DefaultJourney
  host: string
  journey: Journey
  locale: string
  rtl: boolean
}

export const GET_JOURNEYS_FIELDS = gql`
  ${JOURNEY_FIELDS}
  query GetJourneysFields($featured: Boolean, $options: JourneysQueryOptions) {
    journeys(
      where: { featured: $featured, template: false }
      options: $options
    ) {
      id
      ...JourneyFields
    }
  }
`

function HostJourneysPage(
  props: HostJourneysPageProps | NotFoundPageProps | DefaulJourneytHostPageProps
): ReactElement {
  const { t } = useTranslation('apps-journeys')

  return (
    <>
      {props.pageType === PageType.NotFound && (
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
      )}
      {props.pageType === PageType.JourneyCollection && (
        <>
          <JourneysPage {...props} />
        </>
      )}
      {props.pageType === PageType.DefaultJourney && (
        <>
          <HostJourneyPage {...props} />
        </>
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps<
  HostJourneysPageProps | NotFoundPageProps | DefaulJourneytHostPageProps
> = async (context) => {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<
    GetJourneysFields,
    GetJourneysFieldsVariables
  >({
    query: GET_JOURNEYS_FIELDS,
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
        )),
        pageType: PageType.NotFound
      },
      notFound: true,
      revalidate: 1
    }
  } else if (data.journeys.length === 1) {
    const { rtl, locale } = getJourneyRTL(data.journeys[0])
    return {
      props: {
        host: context.params?.host?.toString() ?? '',
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        journey: data.journeys[0],
        locale,
        rtl,
        pageType: PageType.DefaultJourney
      },
      revalidate: 60
    }
  } else {
    return {
      props: {
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        journeys: data.journeys,
        pageType: PageType.JourneyCollection
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
