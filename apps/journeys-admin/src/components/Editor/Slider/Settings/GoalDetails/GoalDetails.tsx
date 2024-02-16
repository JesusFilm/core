import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { Drawer } from '../Drawer'

import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'
import { ActionInformation } from './ActionInformation'

export function GoalDetails(): ReactElement {
  const {
    state: { selectedComponent },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')

  function setSelectedAction(url: string): void {
    dispatch({ type: 'SetSelectedComponentAction', selectedComponent: url })
  }

  return (
    <Drawer
      title={selectedComponent != null ? t('Goal Details') : t('Information')}
    >
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
    </Drawer>
  )
}
