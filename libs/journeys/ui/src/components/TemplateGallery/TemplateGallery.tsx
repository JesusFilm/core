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
import { ResourceHeading } from '../ResourceHeading'

interface TemplateGalleryProps {
  hideOverflow?: boolean
  algoliaIndex?: string
}

function TemplateGalleryContent() {
  return (
    <Stack spacing={10}>
      <ResourceHeading heading="Next step" />
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
