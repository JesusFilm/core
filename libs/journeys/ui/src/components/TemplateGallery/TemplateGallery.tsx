import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import castArray from 'lodash/castArray'
import difference from 'lodash/difference'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

import { Index, RefinementList } from 'react-instantsearch'
import { SearchBar } from '../SearchBar'
import { TagCarousels } from './TagCarousels'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ParentTagIcon } from '../ParentTagIcon'

interface TemplateGalleryProps {
  hideOverflow?: boolean
}

export function TemplateGallery({
  hideOverflow
}: TemplateGalleryProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const router = useRouter()
  const selectedLanguageIds = castArray(router.query.languageIds ?? ['529']) // Defaults to English language
  const selectedTagIds = castArray(router.query.tagIds ?? [])

  function handleTagIdsChange(
    newSelectedTagIds: string[],
    availableTagIds: string[]
  ): void {
    const tagIds = [
      ...difference(selectedTagIds, availableTagIds),
      ...newSelectedTagIds
    ]
    void router.push({ query: { ...router.query, tagIds } }, undefined, {
      shallow: true
    })
  }

  function handleTagIdChange(selectedTagId: string): void {
    void router.push(
      { query: { ...router.query, tagIds: selectedTagId } },
      undefined,
      { shallow: true }
    )
  }

  function handleLanguageIdsChange(values: string[]): void {
    void router.push(
      { query: { ...router.query, languageIds: values } },
      undefined,
      { shallow: true }
    )
  }

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
        <Index indexName="api-journeys-journeys-dev">
          <Stack spacing={10}>
            <SearchBar />

            {/* TODO(jk): Remove/repurpose unused components: HeaderAndLanguageFilter, TagsFilter eta  */}

            {/* TODO: Remove temporary theme fix for styling journeys admin components */}
            <ThemeProvider
              themeName={ThemeName.journeysAdmin}
              themeMode={ThemeMode.light}
              nested
            >
              <TagCarousels onChange={handleTagIdChange} />

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

              {/* TODO(jk): remove these props - algolia to handle */}
              <TemplateSections
                tagIds={selectedTagIds.length > 0 ? selectedTagIds : undefined}
                languageIds={
                  selectedLanguageIds.length > 0
                    ? selectedLanguageIds
                    : undefined
                }
              />
            </ThemeProvider>
          </Stack>
        </Index>
      </Container>
    </Paper>
  )
}
