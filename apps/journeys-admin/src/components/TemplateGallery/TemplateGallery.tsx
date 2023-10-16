import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import castArray from 'lodash/castArray'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { TemplateSections } from '../TemplateSections'

import { LanguageFilter } from './LanguageFilter'

export function TemplateGallery(): ReactElement {
  const { query } = useRouter()
  const { t } = useTranslation()

  // TODO: wrapper around a container
  return (
    <Stack gap={4}>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ px: { xs: 6, lg: 9 } }}
      >
        <Typography variant="h2" sx={{ display: { xs: 'none', lg: 'block' } }}>
          {t('Journey Templates')}
        </Typography>
        <Typography variant="h2" sx={{ display: { xs: 'block', lg: 'none' } }}>
          {t('Templates')}
        </Typography>
        <LanguageFilter />
      </Stack>
      <TemplateSections
        tagIds={query.tagIds != null ? castArray(query.tagIds) : undefined}
        languageId={
          !Array.isArray(query.languageId) ? query.languageId : undefined
        }
      />
    </Stack>
  )
}
