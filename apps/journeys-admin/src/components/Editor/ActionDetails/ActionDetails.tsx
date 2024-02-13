import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'
import { ActionInformation } from './ActionInformation'

interface ActionDetailsProps {
  url?: string
  goalLabel?: (url: string) => string
  setSelectedAction?: (url: string) => void
}

export function ActionDetails({ goalLabel }: ActionDetailsProps): ReactElement {
  const {
    state: { selectedComponent },
    dispatch
  } = useEditor()

  function setSelectedAction(url: string): void {
    dispatch({ type: 'SetSelectedComponentAction', component: url })
  }

  return (
    <Box
      sx={{ overflow: 'auto', height: '100%' }}
      data-testid="EditorActionDetails"
    >
      {selectedComponent != null ? (
        <Stack gap={7} sx={{ px: 6, pb: 6 }}>
          <ActionEditor
            url={selectedComponent}
            goalLabel={goalLabel}
            setSelectedAction={setSelectedAction}
          />
          <ActionCards url={selectedComponent} />
        </Stack>
      ) : (
        <ActionInformation />
      )}
    </Box>
  )
}
