import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'
import { ActionInformation } from './ActionInformation'

interface ActionDetailsProps {
  url?: string
  goalLabel?: (url: string) => string
  selectedAction?: (url: string) => void
}

export function ActionDetails({
  url,
  goalLabel,
  selectedAction
}: ActionDetailsProps): ReactElement {
  return (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      {url != null ? (
        <Stack gap={2} sx={{ px: 6, pb: 6 }}>
          <ActionEditor
            url={url}
            goalLabel={goalLabel}
            selectedAction={selectedAction}
          />
          <ActionCards url={url} />
        </Stack>
      ) : (
        <ActionInformation />
      )}
    </Box>
  )
}
