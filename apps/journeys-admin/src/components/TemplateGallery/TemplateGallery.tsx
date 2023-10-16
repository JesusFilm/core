import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GetTags_tags as Tag } from '../../../__generated__/GetTags'
import { TemplateSections } from '../TemplateSections'

import { LanguageFilter } from './LanguageFilter'
import { TagsFilter } from './TagsFilter'

export function TemplateGallery(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [languageId, setLanguageId] = useState('529')
  const [selectedTags1, setSelectedTags1] = useState<Tag[]>([])
  const [selectedTags2, setSelectedTags2] = useState<Tag[]>([])
  const [selectedTags3, setSelectedTags3] = useState<Tag[]>([])

  const selectedTags = useMemo(
    () => [...selectedTags1, ...selectedTags2, ...selectedTags3],
    [selectedTags1, selectedTags2, selectedTags3]
  )

  return (
    <Container disableGutters>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          pb: { xs: 6, md: 9 }
        }}
      >
        <Typography variant="h2" sx={{ display: { xs: 'none', lg: 'block' } }}>
          {t('Journey Templates')}
        </Typography>
        <Typography variant="h2" sx={{ display: { xs: 'block', lg: 'none' } }}>
          {t('Templates')}
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
