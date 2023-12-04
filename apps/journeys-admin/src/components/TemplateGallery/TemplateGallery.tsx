import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import castArray from 'lodash/castArray'
import difference from 'lodash/difference'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TemplateSections } from '../TemplateSections'

import { LocalButtonLoading } from './HeaderAndLanguageFilter/LocalButtonLoading/LocalButtionLoading'
import { TagCarousels } from './TagCarousels'
import { TagsFilter } from './TagsFilter'

const DynamicHeaderAndLanguageFilter = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "HeaderAndLanguageFilter" */
      './HeaderAndLanguageFilter'
    ).then((mod) => mod.HeaderAndLanguageFilter),
  { ssr: false, loading: () => <LocalButtonLoading /> }
)

export function TemplateGallery(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>(
    router.query.languageIds != null
      ? castArray(router.query.languageIds)
      : ['529']
  )
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    router.query.tagIds != null ? castArray(router.query.tagIds) : []
  )

  function handleTagIdsChange(
    newSelectedTagIds: string[],
    availableTagIds: string[]
  ): void {
    const tagIds = [
      ...difference(selectedTagIds, availableTagIds),
      ...newSelectedTagIds
    ]
    setSelectedTagIds(tagIds)
    router.query.tagIds = tagIds
    void router.push(router)
  }

  function handleTagIdChange(selectedTagId: string): void {
    setSelectedTagIds([selectedTagId])
    router.query.tagIds = selectedTagId
    void router.push(router)
  }

  function handleLanguageIdsChange(values: string[]): void {
    setSelectedLanguageIds(values)
    router.query.languageIds = values
    void router.push(router)
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
        sx={{
          maxWidth: { md: '90vw' },
          px: { xs: 6, sm: 8 },
          py: { xs: 6, sm: 9 }
        }}
      >
        <Suspense fallback={<LocalButtonLoading />}>
          <DynamicHeaderAndLanguageFilter
            selectedLanguageIds={selectedLanguageIds}
            onChange={handleLanguageIdsChange}
          />
        </Suspense>
        <Grid
          container
          spacing={2}
          sx={{
            mb: { xs: 1, md: 3 }
          }}
          id="TemplateGalleryTagsFilter"
        >
          <Grid item xs={12} md={7}>
            <TagsFilter
              label={t('Topics, holidays, felt needs, collections')}
              tagNames={['Topics', 'Holidays', 'Felt Needs', 'Collections']}
              onChange={handleTagIdsChange}
              selectedTagIds={selectedTagIds}
              popperElementId="TemplateGalleryTagsFilter"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TagsFilter
                  label={t('Audience')}
                  tagNames={['Audience']}
                  onChange={handleTagIdsChange}
                  selectedTagIds={selectedTagIds}
                  popperElementId="TemplateGalleryAudienceTagsFilter"
                />
              </Grid>
              <Grid item xs={6}>
                <TagsFilter
                  label={t('Genre')}
                  tagNames={['Genre']}
                  onChange={handleTagIdsChange}
                  selectedTagIds={selectedTagIds}
                  popperElementId="TemplateGalleryGenreTagsFilter"
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                id="TemplateGalleryAudienceTagsFilter"
                sx={{ p: '0 !important' }}
              />
              <Grid
                item
                xs={12}
                md={6}
                id="TemplateGalleryGenreTagsFilter"
                sx={{ p: '0 !important' }}
              />
            </Grid>
          </Grid>
        </Grid>
        <TagCarousels
          selectedTagIds={selectedTagIds}
          onChange={handleTagIdChange}
        />
        <TemplateSections
          tagIds={selectedTagIds.length > 0 ? selectedTagIds : undefined}
          languageIds={
            selectedLanguageIds.length > 0 ? selectedLanguageIds : undefined
          }
        />
      </Container>
    </Paper>
  )
}
