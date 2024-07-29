import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

import { Index } from 'react-instantsearch'
import { SearchBar } from '../SearchBar'
import { TagCarousels } from './TagCarousels'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import Stack from '@mui/material/Stack'
import { castArray } from 'lodash'
import { useRouter } from 'next/router'
import { HeaderAndLanguageFilter } from './HeaderAndLanguageFilter'

interface TemplateGalleryProps {
  hideOverflow?: boolean
  algoliaIndex?: string
}

function TemplateGalleryContent() {
  const router = useRouter()

  const selectedLanguageIds = router.isReady
    ? castArray(router.query.languageIds ?? ['529'])
    : undefined

  function handleLanguageIdsChange(values: string[]): void {
    void router.push(
      { query: { ...router.query, languageIds: values } },
      undefined,
      { shallow: true }
    )
  }

  return (
    <Stack spacing={10}>
      {/* TODO: Remove temporary theme fix for styling journeys admin components */}
      <ThemeProvider
        themeName={ThemeName.journeysAdmin}
        themeMode={ThemeMode.light}
        nested
      >
        <HeaderAndLanguageFilter
          selectedLanguageIds={selectedLanguageIds}
          onChange={handleLanguageIdsChange}
        />
      </ThemeProvider>

      <SearchBar />

      {/* TODO: Remove temporary theme fix for styling journeys admin components */}
      <ThemeProvider
        themeName={ThemeName.journeysAdmin}
        themeMode={ThemeMode.light}
        nested
      >
        <TagCarousels />

        <TemplateSections />
      </ThemeProvider>
    </Stack>
  )
}

export function TemplateGallery({
  hideOverflow,
  algoliaIndex
}: TemplateGalleryProps): ReactElement {
  return (
    <Paper
      elevation={0}
      square
      sx={{ height: '100%' }}
      data-testid="TemplateGallery"
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          overflow: hideOverflow ? 'hidden' : 'none',
          px: { xs: 0 },
          py: { xs: 6, sm: 9 }
        }}
      >
        {/* Needed so that tests don't fail */}
        {algoliaIndex ? (
          <Index indexName={algoliaIndex}>
            <TemplateGalleryContent />
          </Index>
        ) : (
          <TemplateGalleryContent />
        )}
      </Container>
    </Paper>
  )
}
