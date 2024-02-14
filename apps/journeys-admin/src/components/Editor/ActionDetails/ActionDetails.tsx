import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'
import { ActionInformation } from './ActionInformation'

export function ActionDetails(): ReactElement {
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
