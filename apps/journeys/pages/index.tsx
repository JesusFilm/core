import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import { gql } from '@apollo/client'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { createApolloClient } from '../src/libs/apolloClient'
import {
  GetJourneys,
  GetJourneys_journeys as Journey
} from '../__generated__/GetJourneys'
import { ThemeMode, ThemeName } from '../__generated__/globalTypes'
import i18nConfig from '../next-i18next.config'

interface JourneysPageProps {
  journeys: Journey[]
}

function JourneysPage({ journeys }: JourneysPageProps): ReactElement {
  return (
    <>
      <NextSeo nofollow noindex />
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        <Container>
          {journeys.map(({ id, title, slug }) => (
            <Box key={id} my={2}>
              <Link href={`/${slug}`} passHref>
                <Button variant="contained" color="primary" fullWidth>
                  {title}
                </Button>
              </Link>
            </Box>
          ))}
        </Container>
      </ThemeProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps<JourneysPageProps> = async (
  context
) => {
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
