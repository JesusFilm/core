import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { AccessControl } from './AccessControl'
import { JourneyDetails } from './JourneyDetails'
import { JourneyLink } from './JourneyLink'

interface PropertiesProps {
  isPublisher?: boolean
}

export function Properties({ isPublisher }: PropertiesProps): ReactElement {
  return (
    <Stack spacing={4} sx={{ py: 4 }} data-testid="Properties">
      <Box sx={{ px: 6 }}>
        <JourneyDetails isPublisher={isPublisher} />
      </Box>
      <Divider />
      <Box sx={{ px: 6 }}>
        <AccessControl />
      </Box>
      <Divider />
      <Box sx={{ px: 6 }}>
        <JourneyLink />
      </Box>
    </Stack>
  )
}
