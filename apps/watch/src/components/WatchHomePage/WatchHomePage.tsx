import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'
import { Index } from 'react-instantsearch'

import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'
import { SearchBar } from '@core/journeys/ui/SearchBar'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { useAlgoliaRouter } from '../../libs/algolia/useAlgoliaRouter'
import { PageWrapper } from '../PageWrapper'
import { AlgoliaVideoGrid } from '../VideoGrid/AlgoliaVideoGrid'

import { HomeHero } from './HomeHero'
import { SeeAllVideos } from './SeeAllVideos'

interface WatchHomePageProps {
  languageId?: string | undefined
}

export function WatchHomePage({
  languageId
}: WatchHomePageProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  useAlgoliaRouter()

  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <PageWrapper
      hero={<HomeHero />}
      headerThemeMode={ThemeMode.dark}
      hideHeaderSpacer
      showLanguageSwitcher
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
            <Index indexName={indexName}>
              <Box sx={{ pb: 10 }}>
                <SearchBarProvider>
                  <SearchBar showDropdown showLanguageButton />
                </SearchBarProvider>
              </Box>
              <AlgoliaVideoGrid variant="contained" languageId={languageId} />
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
