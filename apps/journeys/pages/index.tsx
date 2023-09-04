import { gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourneys,
  GetJourneys_journeys as Journey
} from '../__generated__/GetJourneys'
import { ThemeMode, ThemeName } from '../__generated__/globalTypes'
import i18nConfig from '../next-i18next.config'
import logo from '../public/logo.svg'
import { createApolloClient } from '../src/libs/apolloClient'

interface JourneysPageProps {
  journeys: Journey[]
}

const StyledIframe = styled('iframe')(({ theme }) => ({}))

function JourneysPage({ journeys }: JourneysPageProps): ReactElement {
  const { t } = useTranslation('journeys')

  return (
    <>
      <NextSeo nofollow noindex />
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        <Container maxWidth="xxl">
          <Stack spacing={8} py={8}>
            <Image src={logo} alt="Next Steps" height={68} width={152} />
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
                              width: 'calc(100% + 64px)',
                              height: 664,
                              border: 'none',
                              margin: '-32px'
                            }}
                          />
                        </Fade>
                      </Box>
                      <NextLink href={`/${slug}`} passHref>
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
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <NextLink
                href="https://www.cru.org/us/en/about/terms-of-use.html"
                passHref
              >
                <Link
                  variant="body2"
                  underline="none"
                  target="_blank"
                  rel="noopener"
                  sx={{ p: 0 }}
                >
                  {t('Terms & Conditions')}
                </Link>
              </NextLink>
              <NextLink
                href="https://www.cru.org/us/en/about/privacy.html"
                passHref
              >
                <Link
                  variant="body2"
                  underline="none"
                  target="_blank"
                  rel="noopener"
                  sx={{ p: 0 }}
                >
                  {t('Privacy Policy')}
                </Link>
              </NextLink>
              <Typography variant="body2">
                {t('NextSteps © {{year}}', { year: new Date().getFullYear() })}
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </ThemeProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps<
  Omit<JourneysPageProps, 'deviceType'>
> = async (context) => {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetJourneys>({
    query: gql`
      query GetJourneys {
        journeys(where: { featured: true }) {
          id
          title
          slug
        }
      }
    `
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

export default JourneysPage
