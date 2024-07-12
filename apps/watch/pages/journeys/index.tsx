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

function Hit({ hit }) {
  return (
    <article>
      <img src={hit.image.src} alt={hit.image.alt} width={50} />
      <h1>
        <Highlight attribute="title" hit={hit} />
      </h1>
      <p>{hit.date}</p>
      <p>{hit.language}</p>
      <p>{hit.tags.toString()}</p>
      <p>{hit.objectID}</p>
    </article>
  )
}

function StratHit({ hit }) {
  return (
    <article>
      <h1>
        <Highlight attribute="post_title" hit={hit} />
      </h1>
      <p>{hit.objectID}</p>
      <p>{hit.content}</p>
      <p>{hit.post_type_label}</p>
      <p>{hit.post_date_formatted}</p>
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
            {/* There needs to be a default index for all algolia widgets
            This is not set at the _app level because we want to default
            to different indexes on each page of the app */}
            <Index indexName="api-journeys-journeys-dev">
              {/* Searchbar should also search below indexes */}
              <SearchBar />

              <Index indexName="api-journeys-journeys-dev">
                <Configure hitsPerPage={10} />
                <Hits hitComponent={Hit} />
              </Index>

              <Index indexName="wp_dev_posts_mission-trip">
                <Configure hitsPerPage={10} />
                <Hits hitComponent={StratHit} />
              </Index>

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
