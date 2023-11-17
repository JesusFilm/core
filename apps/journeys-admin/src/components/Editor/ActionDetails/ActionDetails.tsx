import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'
import { ActionInformation } from './ActionInformation'

interface ActionDetailsProps {
  url?: string
  goalLabel?: (url: string) => string
  setSelectedAction?: (url: string) => void
}

export function ActionDetails({
  url,
  goalLabel,
  setSelectedAction
}: ActionDetailsProps): ReactElement {
  return (
    <Box
      sx={{ overflow: 'auto', height: '100%' }}
      data-testid="EditorActionDetails"
    >
      {url != null ? (
        <Stack gap={7} sx={{ px: 6, pb: 6 }}>
          <ActionEditor
            url={url}
            goalLabel={goalLabel}
            setSelectedAction={setSelectedAction}
          />
          <ActionCards url={url} />
        </Stack>
      ) : (
        <ActionInformation />
      )}
    </Box>
  )
}
