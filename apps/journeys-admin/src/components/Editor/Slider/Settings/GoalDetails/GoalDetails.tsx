import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { EditorDrawer } from '../Drawer/EditorDrawer'

import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'
import { ActionInformation } from './ActionInformation'

export function GoalDetails(): ReactElement {
  const {
    state: { selectedGoalUrl, selectedStep },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')

  function setSelectedAction(url: string): void {
    dispatch({ type: 'SetSelectedGoalUrlAction', selectedGoalUrl: url })
  }
  function onClose(): void {
    if (selectedStep != null) {
      dispatch({
        type: 'SetActiveContentAction',
        activeContent: ActiveContent.Canvas
      })
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.JourneyFlow
      })
    } else {
      dispatch({
        type: 'SetActiveContentAction',
        activeContent: ActiveContent.Social
      })
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.Content
      })
    }
  }

  return (
    <EditorDrawer
      data-testid="GoalDetails"
      title={selectedGoalUrl != null ? t('Goal Details') : t('Information')}
      onClose={onClose}
    >
      <Box
        sx={{ overflow: 'auto', height: '100%' }}
        data-testid="EditorActionDetails"
      >
        {selectedGoalUrl != null ? (
          <Stack gap={7} sx={{ px: 6, pb: 6 }}>
            <ActionEditor
              url={selectedGoalUrl}
              setSelectedAction={setSelectedAction}
            />
            <ActionCards url={selectedGoalUrl} />
          </Stack>
        ) : (
          <ActionInformation />
        )}
      </Box>
    </EditorDrawer>
  )
}
