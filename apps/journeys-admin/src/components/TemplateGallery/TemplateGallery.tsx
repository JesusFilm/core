import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { ReactElement, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GetTags_tags as Tag } from '../../../__generated__/GetTags'
import { TemplateSections } from '../TemplateSections'

import { TagsFilter } from './TagsFilter'

export function TemplateGallery(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [selectedTags1, setSelectedTags1] = useState<Tag[]>([])
  const [selectedTags2, setSelectedTags2] = useState<Tag[]>([])
  const [selectedTags3, setSelectedTags3] = useState<Tag[]>([])

  const selectedTags = useMemo(
    () => [...selectedTags1, ...selectedTags2, ...selectedTags3],
    [selectedTags1, selectedTags2, selectedTags3]
  )

  return (
    <Container disableGutters>
      <Grid
        container
        spacing={2}
        sx={{
          px: { xs: 6, lg: 9 },
          pb: { xs: 6, md: 9 }
        }}
      >
        <Grid item xs={12} md={8}>
          <TagsFilter
            label={t('Topics, holidays, felt needs, collections')}
            tagNames={['Topics', 'Holidays', 'Felt Needs', 'Collections']}
            onChange={(value) => setSelectedTags1(value)}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TagsFilter
            label={t('Audience')}
            tagNames={['Audience']}
            onChange={(value) => setSelectedTags2(value)}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TagsFilter
            label={t('Genre')}
            tagNames={['Genre']}
            onChange={(value) => setSelectedTags3(value)}
          />
        </Grid>
      </Grid>
      <TemplateSections
        tagIds={
          selectedTags.length > 0 ? selectedTags.map(({ id }) => id) : undefined
        }
      />
    </Container>
  )
}
