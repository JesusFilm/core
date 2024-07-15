import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import i18nConfig from '../../next-i18next.config'
import { getFlags } from '../../src/libs/getFlags'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { TemplateGallery } from '@core/journeys/ui/TemplateGallery'
import { PageWrapper } from '../../src/components/PageWrapper'
import { SearchBar } from '../../src/components/SearchBar/SearchBar'

import Stack from '@mui/material/Stack'
import { Configure, Highlight, Hits, Index } from 'react-instantsearch'

// TODO(jk): see useVideoSearch interfaces
type AlgoliaJourney = {
  objectID: string
  title: string
  description: string
  tags: {
    Topics: string[]
    Audience: string[]
    Holidays: string[]
    Collections: string[]
  }
  image: {
    src: string
    alt: string
  }
  language: string
  date: Date
  featuredAt?: string
}

function JourneysPage(): ReactElement {
  return (
    <PageWrapper>
      <Box
        sx={{ backgroundColor: 'background.default' }}
        data-testid="JourneysPage"
      >
        <Container maxWidth="xxl">
          <Stack gap={10}>
            <Index indexName="api-journeys-journeys-dev">
              {/* <SearchBar /> */}
              <ThemeProvider
                themeName={ThemeName.journeysAdmin}
                themeMode={ThemeMode.light}
                nested
              >
                <TemplateGallery hideOverflow />
              </ThemeProvider>
            </Index>
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const flags = await getFlags()

  if (flags.journeys !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  return {
    revalidate: 60,
    props: {
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default JourneysPage
