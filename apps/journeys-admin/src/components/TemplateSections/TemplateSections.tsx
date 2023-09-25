import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { FeaturedAndNewTemplates } from './FeaturedAndNewTemplates'
import { MostRelevantTemplates } from './MostRelevantTemplates'

interface Props {
  tags?: string[]
}

export function TemplateSections({ tags }: Props): ReactElement {
  return (
    <Stack spacing={8}>
      {tags != null ? (
        <MostRelevantTemplates tags={tags} />
      ) : (
        <FeaturedAndNewTemplates />
      )}
    </Stack>
  )
}
