import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { Index } from 'react-instantsearch'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { SearchBar } from '../SearchBar'
import { TemplateSections } from '../TemplateSections'


import { TagCarousels } from './TagCarousels'


interface TemplateGalleryProps {
  hideOverflow?: boolean
  algoliaIndex?: string
}

function TemplateGalleryContent() {
  return (
    <Stack spacing={10}>
      {/* TODO: Remove temporary theme fix for styling journeys admin components */}
      <ThemeProvider
        themeName={ThemeName.website}
        themeMode={ThemeMode.light}
        nested
      >
        <SearchBar />
      </ThemeProvider>

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
