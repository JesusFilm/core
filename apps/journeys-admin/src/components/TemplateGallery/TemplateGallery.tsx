import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import castArray from 'lodash/castArray'
import difference from 'lodash/difference'
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
  const ENGLISH_LANGUAGE_ID = '529'
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>(
    router.query.languageIds != null
      ? castArray(router.query.languageIds)
      : [ENGLISH_LANGUAGE_ID]
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

  function handleLanguageIdsChange(values: string[]): void {
    setSelectedLanguageIds(values)
    router.query.languageIds = values
    void router.push(router)
  }

  return (
    <Container disableGutters data-testid="TemplateGallery">
      <HeaderAndLanguageFilter
        selectedLanguageIds={selectedLanguageIds}
        onChange={handleLanguageIdsChange}
      />
      <Grid
        container
        spacing={2}
        sx={{
          mb: { xs: 5, md: 7 }
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
        onChange={handleTagIdsChange}
      />
      <TemplateSections
        tagIds={selectedTagIds.length > 0 ? selectedTagIds : undefined}
        languageIds={
          selectedLanguageIds.length > 0 ? selectedLanguageIds : undefined
        }
      />
    </Container>
  )
}
