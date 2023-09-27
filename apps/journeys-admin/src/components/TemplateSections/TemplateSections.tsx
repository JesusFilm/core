import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { FeaturedAndNewTemplates } from './FeaturedAndNewTemplates'
import { MostRelevantTemplates } from './MostRelevantTemplates'

export function TemplateSections(): ReactElement {
  const router = useRouter()
  const tags = router.query.tags

  return (
    <Stack spacing={8}>
      {tags != null ? <MostRelevantTemplates /> : <FeaturedAndNewTemplates />}
    </Stack>
  )
}
