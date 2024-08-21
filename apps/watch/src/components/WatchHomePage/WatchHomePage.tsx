import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useState } from 'react'
import { Index, RefinementList, useRefinementList } from 'react-instantsearch'

import { SearchBar } from '@core/journeys/ui/SearchBar'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { useAlgoliaRouter } from '../../libs/algolia/useAlgoliaRouter'
import { PageWrapper } from '../PageWrapper'
import { AlgoliaVideoGrid } from '../VideoGrid/AlgoliaVideoGrid/AlgoliaVideoGrid'

import { HomeHero } from './HomeHero'
import { SeeAllVideos } from './SeeAllVideos'

export function WatchHomePage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''
  const [ showLanguageDropdown, setShowLanguageDropdown ] = useState(false)
  const [ languageFacetMax, setLanguageFacetMax ] = useState(10)

  const { items } = useRefinementList({
    attribute: 'languageEnglishName'
  })

  useAlgoliaRouter()

  return (
    <PageWrapper
      hero={<HomeHero />}
      headerThemeMode={ThemeMode.dark}
      hideHeaderSpacer
    >
      <ThemeProvider
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
        nested
      >
        <Box
          sx={{ backgroundColor: 'background.default' }}
          data-testid="WatchHomePage"
        >
          <Container maxWidth="xxl" sx={{ paddingY: '4rem' }}>
            <Box sx={{ pb: 10 }}>
              <SearchBar handleLanguageClick={() => setShowLanguageDropdown(!showLanguageDropdown)} />
            </Box>

            {items.length === 0 ? (
              <Box sx={{ pb: 10 }} color='red'>
                No langauges available based on your search!
                If we don't like this - maybe we conditionally render our own selection of langauges - but they won't do anything when clicked if there are already no results to further refine? 
                When there are no results algolia has a few settings for softening the search to make sure there will be some hits & facets showing.
              </Box>
            ) : (
              <Box border='white 2px solid' sx={{mb: 8}} display={showLanguageDropdown ? 'none' : 'hidden'}>
                <Stack direction="row" marginBottom={10} color='white' >
                  <Box
                  sx={{
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
                      <Typography variant="subtitle1" color='red'>Africa</Typography>
                    </Stack>
                    <RefinementList attribute="languageEnglishName" limit={languageFacetMax} />
                  </Box>
  
                  <Box
                  sx={{
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
                      <Typography variant="subtitle1" color='red'>Europe</Typography>
                    </Stack>
                    <RefinementList attribute="languageEnglishName" limit={languageFacetMax} />
                    Max {languageFacetMax} langauges here
                  </Box>
  
                  <Box
                  sx={{
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
                      <Typography variant="subtitle1" color='red'>Americas</Typography>
                    </Stack>
                    <RefinementList attribute="languageEnglishName" limit={languageFacetMax} />
                    Max {languageFacetMax} langauges here
                  </Box>
  
                  <Box
                  sx={{
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
                      <Typography variant="subtitle1" color='red'>Asia</Typography>
                    </Stack>
                    <RefinementList attribute="languageEnglishName" limit={languageFacetMax} />
                    Max {languageFacetMax} langauges here
                  </Box>
  
                  <Box
                  sx={{
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
                      <Typography variant="subtitle1" color='red'>Middle East</Typography>
                    </Stack>
                    <RefinementList attribute="languageEnglishName" limit={languageFacetMax} />
                    Max {languageFacetMax} langauges here
                  </Box>
                </Stack>
                {languageFacetMax < 200 && (
                  <Stack alignContent='center'>
                    <Button sx={{mx: 'auto'}} onClick={() => setLanguageFacetMax(200)}>See All</Button>
                  </Stack>
                )}
                {languageFacetMax === 200 && (
                  <Stack alignContent='center'>
                    <Button sx={{mx: 'auto'}} onClick={() => setLanguageFacetMax(20)}>See Less</Button>
                  </Stack>
                )}
              </Box>
            )}

            <Index indexName={indexName}>
              <AlgoliaVideoGrid variant="contained" />
            </Index>
            <SeeAllVideos />
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                position: 'relative',
                py: { xs: 10, lg: 20 }
              }}
            >
              <Stack spacing={10}>
                <Typography variant="h3" component="h2" color="text.primary">
                  {t('About Our Project')}
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      height: 'inherit',
                      width: { xs: 38, lg: 14 }
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    component="h3"
                    sx={{ opacity: 0.85 }}
                    color="text.primary"
                  >
                    {t(
                      'With 70% of the world not being able to speak English, there ' +
                        'is a huge opportunity for the gospel to spread to unreached ' +
                        'places. We have a vision to make it easier to watch, ' +
                        'download and share Christian videos with people in their ' +
                        'native heart language.'
                    )}
                  </Typography>
                </Stack>
                <Typography
                  variant="subtitle1"
                  component="h3"
                  sx={{ opacity: 0.8 }}
                  color="text.primary"
                >
                  {t(
                    'Jesus Film Project is a Christian ministry with a vision to ' +
                      'reach the world with the gospel of Jesus Christ through ' +
                      'evangelistic videos. Watch from over 2000 languages on any ' +
                      'device and share it with others.'
                  )}
                </Typography>
              </Stack>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </PageWrapper>
  )
}
