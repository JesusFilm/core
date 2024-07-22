import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

import { Index, RefinementList, useRefinementList } from 'react-instantsearch'
import { SearchBar } from '../SearchBar'
import { TagCarousels } from './TagCarousels'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CategoriesFilter } from '../../../../../../apps/watch/src/components/CategoriesFilter'
import { ParentTagIcon } from '../ParentTagIcon'

interface TemplateGalleryProps {
  hideOverflow?: boolean
  algoliaIndex?: string
}
// render all the tags
// what if i put it into tagsfilter autocomplete ?

function TemplateGalleryContent() {
  // const hits = useHits()
  // function extractCategories() {
  //   return [...new Set(hits.flatMap((journey) => Object.keys(journey.tags)))]
  // }

  // const categories = extractCategories()
  const { items } = useRefinementList({ attribute: 'tags.Felt Needs' })
  console.log(items)
  return (
    <Stack spacing={10}>
      <SearchBar />

      {/* TODO: Remove temporary theme fix for styling journeys admin components */}
      <ThemeProvider
        themeName={ThemeName.journeysAdmin}
        themeMode={ThemeMode.light}
        nested
      >
        <CategoriesFilter />
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
              <ParentTagIcon name="Felt Needs" sx={{ width: 38 }} />
              <Typography variant="subtitle1">Felt Needs</Typography>
            </Stack>
            <RefinementList attribute="tags.Felt Needs" />
          </Box>
        </Stack>
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
