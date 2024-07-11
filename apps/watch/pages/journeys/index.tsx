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
import { Stack } from '@mui/system'
import { PageWrapper } from '../../src/components/PageWrapper'
import { SearchBar } from '../../src/components/SearchBar/SearchBar'

import { Highlight, Hits, Index, RefinementList } from 'react-instantsearch'

function Hit({ hit }) {
  return (
    <article>
      <p>{hit.objectId}</p>
      <img src={hit.image.src} alt={hit.image.alt} width={50} />
      <h1>
        <Highlight attribute="title" hit={hit} />
      </h1>
      <p>{hit.date}</p>
      <p>{hit.languageId}</p>
      <p>{hit.tags.toString()}</p>
    </article>
  )
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
              <SearchBar />
              <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '20px' }}>
                  <h2>Filter by Tags</h2>
                  <RefinementList attribute="tags" />

                  <h2>Filter by LanguageId</h2>
                  <RefinementList attribute="languageId" />
                </div>
                <div>
                  <Hits hitComponent={Hit} />
                </div>
              </div>

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
