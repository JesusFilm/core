import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GetTags_tags as Tag } from '../../../__generated__/GetTags'
import { TemplateSections } from '../TemplateSections'

import { TagsFilter } from './TagsFilter'

export function TemplateGallery(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  return (
    <Container disableGutters>
      <Grid
        container
        spacing={2}
        sx={{
          pb: { xs: 6, md: 9 }
        }}
      >
        <Grid item xs={12} md={8}>
          <TagsFilter
            label={t('Topics, holidays, felt needs, collections')}
            tagNames={['Topics', 'Holidays', 'Felt Needs', 'Collections']}
            onChange={(value) => setSelectedTagIds(value)}
            selectedTagIds={selectedTagIds}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TagsFilter
            label={t('Audience')}
            tagNames={['Audience']}
            onChange={(value) => setSelectedTagIds(value)}
            selectedTagIds={selectedTagIds}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TagsFilter
            label={t('Genre')}
            tagNames={['Genre']}
            onChange={(value) => setSelectedTagIds(value)}
            selectedTagIds={selectedTagIds}
          />
        </Grid>
      </Grid>
      <TemplateSections
        tagIds={selectedTagIds.length > 0 ? selectedTagIds : undefined}
      />
    </Container>
  )
}
