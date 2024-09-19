import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourneysSummary,
  GetJourneysSummaryVariables,
  GetJourneysSummary_journeys as Journey
} from '../../__generated__/GetJourneysSummary'
import { ThemeMode, ThemeName } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import logo from '../../public/logo.svg'
import { createApolloClient } from '../../src/libs/apolloClient'
import { GET_JOURNEYS } from '../home'

interface HostJourneysPageProps {
  journeys: Journey[]
}

const StyledIframe = styled('iframe')(() => ({}))

function HostJourneysPage({ journeys }: HostJourneysPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys')
  return (
    <>
      <NextSeo nofollow noindex />
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        <Container maxWidth="xxl">
          <Stack spacing={8} py={8}>
            {journeys.length === 0 ? (
              <>
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
              </>
            ) : (
              <Box>
                <Grid container spacing={{ xs: 2, sm: 4 }}>
                  {journeys.map(({ id, slug }, index) => (
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
            )}
          </Stack>
        </Container>
      </ThemeProvider>
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
      notFound: true,
      revalidate: 1
    }
  } else if (data.journeys.length === 1) {
    return {
      redirect: {
        destination: `/${data.journeys[0].slug}?defaultJourney=true`,
        permanent: false
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
