import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { FeaturedAndNewTemplates } from './FeaturedAndNewTemplates'

export function TemplateSections(): ReactElement {
  const router = useRouter()
  const tags = router.query.tags

  return (
    <Stack spacing={8}>
      {tags != null ? (
        // replace with MostRelevantTemplates Component
        <>
          <Typography variant="h3">Tag Ids</Typography>
          {Array.isArray(tags) &&
            tags.map((tag, i) => (
              <Typography key={i} variant="h4">
                {tag}
              </Typography>
            ))}
        </>
      ) : (
        <FeaturedAndNewTemplates />
      )}
    </Stack>
  )
}
