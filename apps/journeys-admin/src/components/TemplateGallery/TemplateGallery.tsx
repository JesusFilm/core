import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
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
    <Paper elevation={0} square sx={{ height: '100%' }}>
      <Container
        sx={{
          px: { xs: 6, sm: 8 },
          py: { xs: 6, sm: 9 }
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            pb: { xs: 6, md: 9 }
          }}
        >
          <Typography
            variant="h2"
            sx={{ display: { xs: 'none', lg: 'block' } }}
          >
            {t('Journey Templates')}
          </Typography>
          <Typography
            variant="h2"
            sx={{ display: { xs: 'block', lg: 'none' } }}
          >
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
              onChange={handleChange}
              selectedTagIds={selectedTagIds}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TagsFilter
              label={t('Audience')}
              tagNames={['Audience']}
              onChange={handleChange}
              selectedTagIds={selectedTagIds}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TagsFilter
              label={t('Genre')}
              tagNames={['Genre']}
              onChange={handleChange}
              selectedTagIds={selectedTagIds}
            />
          </Grid>
        </Grid>
        <TemplateSections
          tagIds={selectedTagIds.length > 0 ? selectedTagIds : undefined}
          languageId={languageId}
        />
      </Container>
    </Paper>
  )
}
