import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import castArray from 'lodash/castArray'
import difference from 'lodash/difference'
import uniq from 'lodash/uniq'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TemplateSections } from '../TemplateSections'

import { HeaderAndLanguageFilter } from './HeaderAndLanguageFilter'
import { TagCarousels } from './TagCarousels'
import { TagsFilter } from './TagsFilter'

export function TemplateGallery(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>(
    router.query.languageIds != null
      ? (router.query.languageIds as string).split(',')
      : ['529']
  )
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    router.query.tagIds != null ? castArray(router.query.tagIds) : []
  )
  const buildQueryString = ({
    tagIds = selectedTagIds,
    languageIds = selectedLanguageIds
  }): string => {
    const base = router.basePath
    const params: string[] = []
    if (languageIds.length > 0) {
      params.push(`languageIds=${uniq(languageIds).join(',')}`)
    }
    if (tagIds.length > 0) {
      params.push(`tagIds=${uniq(tagIds).join(',')}`)
    }
    return params.length === 0 ? base : `${base}?${params.join('&')}`
  }

  function handleTagIdsChange(
    newSelectedTagIds: string[],
    availableTagIds: string[]
  ): void {
    const tagIds = [
      ...difference(selectedTagIds, availableTagIds),
      ...newSelectedTagIds
    ]
    setSelectedTagIds(tagIds)
    void router.push(buildQueryString({ tagIds }))
  }

  function handleTagIdChange(selectedTagId: string): void {
    setSelectedTagIds([selectedTagId])
    void router.push(buildQueryString({ tagIds: [selectedTagId] }))
  }

  function handleLanguageIdsChange(values: string[]): void {
    setSelectedLanguageIds(values)
    void router.push(buildQueryString({ languageIds: values }))
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
        <HeaderAndLanguageFilter
          selectedLanguageIds={selectedLanguageIds}
          onChange={handleLanguageIdsChange}
        />
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
