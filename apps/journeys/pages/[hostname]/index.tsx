import { gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import NextLink from 'next/link'
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
import { JourneyPageWrapper } from '../../src/components/JourneyPageWrapper'
import { JourneyRenderer } from '../../src/components/JourneyRenderer'
import { createApolloClient } from '../../src/libs/apolloClient'

enum PageType {
  DefaultJourney = 'DefaultJourney',
  JourneyColletion = 'JourneyCollection',
  NotFound = 'NotFound'
}

interface NotFoundPageProps {
  pageType: PageType.NotFound
}

interface HostJourneysPageProps {
  pageType: PageType.JourneyColletion
  journeys: Journey[]
}

interface DefaulJourneytHostPageProps {
  pageType: PageType.DefaultJourney
  hostname: string
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

const StyledIframe = styled('iframe')(() => ({}))

function HostJourneysPage(
  props: HostJourneysPageProps | NotFoundPageProps | DefaulJourneytHostPageProps
): ReactElement {
  const { t } = useTranslation('apps-journeys')

  return (
    <>
      {props.pageType === 'NotFound' && (
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
      {props.pageType === 'JourneyCollection' && (
        <>
          <NextSeo nofollow noindex />
          <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
            <Container maxWidth="xxl">
              <Stack spacing={8} py={8}>
                <Box>
                  <Grid container spacing={{ xs: 2, sm: 4 }}>
                    {props.journeys.map(({ id, slug }, index) => (
                      <Grid item key={id} xs={12} sm={6} md={4} lg={3}>
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: 0,
                              zIndex: -1,
                              overflow: 'hidden'
                            }}
                          >
                            <Fade in timeout={(index + 1) * 1000}>
                              <StyledIframe
                                src={`/embed/${slug}`}
                                sx={{
                                  width: '100%',
                                  height: 600,
                                  border: 'none'
                                }}
                              />
                            </Fade>
                          </Box>
                          <NextLink href={`/${slug}`} passHref legacyBehavior>
                            <Box
                              component="a"
                              sx={{
                                display: 'block',
                                width: '100%',
                                height: 600
                              }}
                            />
                          </NextLink>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Container>
          </ThemeProvider>
        </>
      )}
      {props.pageType === 'DefaultJourney' && (
        <>
          <Head>
            <link
              rel="alternate"
              type="application/json+oembed"
              href={`https://${
                process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
              }/api/oembed?url=https%3A%2F%2F${
                process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
              }%2F${props.journey.slug}&format=json`}
              title={props.journey.seoTitle ?? undefined}
            />
          </Head>
          <NextSeo
            nofollow
            noindex
            title={props.journey.seoTitle ?? undefined}
            description={props.journey.seoDescription ?? undefined}
            openGraph={{
              type: 'website',
              title: props.journey.seoTitle ?? undefined,
              url: `https://${props.host}/${props.journey.slug}`,
              description: props.journey?.seoDescription ?? undefined,
              images:
                props.journey.primaryImageBlock?.src != null
                  ? [
                      {
                        url: props.journey.primaryImageBlock.src,
                        width: props.journey.primaryImageBlock.width,
                        height: props.journey.primaryImageBlock.height,
                        alt: props.journey.primaryImageBlock.alt,
                        type: 'image/jpeg'
                      }
                    ]
                  : []
            }}
          />
          <JourneyPageWrapper
            journey={props.journey}
            rtl={props.rtl}
            locale={props.locale}
          >
            <JourneyRenderer />
          </JourneyPageWrapper>
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
        hostname: context.params?.hostname?.toString() ?? '',
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
        pageType: PageType.JourneyColletion
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
