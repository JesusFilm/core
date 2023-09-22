import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import { ReactElement } from 'react'

import { GetJourneys_journeys as Journeys } from '../../../../__generated__/GetJourneys'

interface TemplateSectionProps {
  journeys?: Journeys[]
  category: string
}

export function TemplateSection({
  journeys,
  category
}: TemplateSectionProps): ReactElement {
  return (
    <Stack spacing={4}>
      <Typography variant="h2">{category}</Typography>
      <Stack direction="row" spacing={16} sx={{ overflowX: 'auto' }}>
        {journeys?.map((journey) => (
          <Box key={journey?.id}>
            <Typography variant="h4">{journey?.title}</Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
