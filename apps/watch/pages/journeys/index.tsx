import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import i18nConfig from '../../next-i18next.config'
import { getFlags } from '../../src/libs/getFlags'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { SearchBar } from '../../../../libs/journeys/ui/src/components/SearchBar/SearchBar'
import { PageWrapper } from '../../src/components/PageWrapper'

import { ParentTagIcon } from '@core/journeys/ui/ParentTagIcon/ParentTagIcon'
import { TemplateSections } from '@core/journeys/ui/TemplateSections/TemplateSections'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Index, RefinementList } from 'react-instantsearch'

function JourneysPage(): ReactElement {
  return (
    <PageWrapper>
      <Box
        sx={{ backgroundColor: 'background.default' }}
        data-testid="JourneysPage"
      >
        <Container maxWidth="xxl">
          <Stack
            gap={10}
            sx={{
              overflow: 'hidden'
            }}
          >
            {/* TODO(jk): Move these into TemplateGallery */}
            <Index indexName="api-journeys-journeys-dev">
              <h3>Next Step for every interaction</h3>
              <SearchBar />
              <ThemeProvider
                themeName={ThemeName.journeysAdmin}
                themeMode={ThemeMode.light}
                nested
              >
                {/* TODO(jk): only added for testing */}
                <Stack direction="row">
                  <Box
                    sx={{
                      border: 1,
                      p: 1,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      component="li"
                      sx={{ px: 4, py: 2 }}
                    >
                      <ParentTagIcon name="Topics" sx={{ width: 38 }} />
                      <Typography variant="subtitle1">Topics</Typography>
                    </Stack>
                    <RefinementList attribute="tags.Topics" />
                  </Box>

                  <Box
                    sx={{
                      border: 1,
                      p: 1,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      component="li"
                      sx={{ px: 4, py: 2 }}
                    >
                      <ParentTagIcon name="Holidays" sx={{ width: 38 }} />
                      <Typography variant="subtitle1">Holidays</Typography>
                    </Stack>
                    <RefinementList attribute="tags.Holidays" />
                  </Box>

                  <Box
                    sx={{
                      border: 1,
                      p: 1,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      component="li"
                      sx={{ px: 4, py: 2 }}
                    >
                      <ParentTagIcon name="Audience" sx={{ width: 38 }} />
                      <Typography variant="subtitle1">Audience</Typography>
                    </Stack>
                    <RefinementList attribute="tags.Audience" />
                  </Box>

                  <Box
                    sx={{
                      border: 1,
                      p: 1,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      component="li"
                      sx={{ px: 4, py: 2 }}
                    >
                      <ParentTagIcon name="Collections" sx={{ width: 38 }} />
                      <Typography variant="subtitle1">Collections</Typography>
                    </Stack>
                    <RefinementList attribute="tags.Collections" />
                  </Box>
                </Stack>
                <TemplateSections tagIds={undefined} languageIds={undefined} />
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
