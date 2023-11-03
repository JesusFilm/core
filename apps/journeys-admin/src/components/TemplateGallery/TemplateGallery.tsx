import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import castArray from 'lodash/castArray'
import difference from 'lodash/difference'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TemplateSections } from '../TemplateSections'

import { LanguageFilter } from './LanguageFilter'
import { TagsFilter } from './TagsFilter'

export function TemplateGallery(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const ENGLISH_LANGUAGE_ID = '529'
  const [languageId, setLanguageId] = useState(ENGLISH_LANGUAGE_ID)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    router.query.tagIds != null ? castArray(router.query.tagIds) : []
  )

  function handleChange(
    newSelectedTagIds: string[],
    filteredTagIds: string[]
  ): void {
    const tagIds = [
      ...difference(selectedTagIds, filteredTagIds),
      ...newSelectedTagIds
    ]
    setSelectedTagIds(tagIds)
    router.query.tagIds = tagIds
    void router.push(router)
  }

  return (
    <Container disableGutters>
      <Stack
        gap={1}
        justifyContent="space-between"
        sx={{
          pb: { xs: 6, md: 9 },
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'start', md: 'center' }
        }}
      >
        <Typography variant="h2" sx={{ display: { xs: 'none', lg: 'block' } }}>
          {t('Journey Templates')}
        </Typography>
        <Typography variant="h4" sx={{ display: { xs: 'block', lg: 'none' } }}>
          {t('Journey Templates')}
        </Typography>
        <LanguageFilter
          languageId={languageId}
          onChange={(value) => setLanguageId(value)}
        />
      </Stack>
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
          <Grid
            container
            spacing={2}
            id="TemplateGalleryAudienceAndGenreTagsFilter"
          >
            <Grid item xs={6}>
              <TagsFilter
                label={t('Audience')}
                tagNames={['Audience']}
                onChange={handleChange}
                selectedTagIds={selectedTagIds}
                popperElementId="TemplateGalleryAudienceAndGenreTagsFilter"
              />
            </Grid>
            <Grid item xs={6}>
              <TagsFilter
                label={t('Genre')}
                tagNames={['Genre']}
                onChange={handleChange}
                selectedTagIds={selectedTagIds}
                popperElementId="TemplateGalleryAudienceAndGenreTagsFilter"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <TemplateSections
        tagIds={selectedTagIds.length > 0 ? selectedTagIds : undefined}
        languageId={languageId}
      />
    </Container>
  )
}
