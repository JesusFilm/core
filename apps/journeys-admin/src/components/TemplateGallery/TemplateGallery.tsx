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
  const [languageIds, setLanguageIds] = useState<string[]>(
    router.query.languageIds != null ? castArray(router.query.languageIds) : []
  )
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    router.query.tagIds != null ? castArray(router.query.tagIds) : []
  )

  function handleChange(
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

  function handleLanguageChange(values: string[]): void {
    setLanguageIds(values)
    router.query.languageIds = values
    void router.push(router)
  }

  return (
    <Container disableGutters>
      <HeaderAndLanguageFilter
        languageIds={languageIds}
        onChange={handleLanguageChange}
      />
      <Grid
        container
        spacing={2}
        sx={{
          mb: { xs: 6, md: 9 }
        }}
        id="TemplateGalleryTagsFilter"
      >
        <Grid item xs={12} md={7}>
          <TagsFilter
            label={t('Topics, holidays, felt needs, collections')}
            tagNames={['Topics', 'Holidays', 'Felt Needs', 'Collections']}
            onChange={handleChange}
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
                onChange={handleChange}
                selectedTagIds={selectedTagIds}
                popperElementId="TemplateGalleryAudienceTagsFilter"
              />
            </Grid>
            <Grid item xs={6}>
              <TagsFilter
                label={t('Genre')}
                tagNames={['Genre']}
                onChange={handleChange}
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
      <TagCarousels selectedTagIds={selectedTagIds} onChange={handleChange} />
      <TemplateSections
        tagIds={selectedTagIds.length > 0 ? selectedTagIds : undefined}
        languageIds={languageIds}
      />
    </Container>
  )
}
