import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { Drawer, DrawerTitle } from '../Drawer'

import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'
import { ActionInformation } from './ActionInformation'
import { DRAWER_WIDTH } from '../../../constants'
import { Paper } from '@mui/material'

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
    dispatch({
      type: 'SetActiveContentAction',
      activeContent:
        selectedStep == null ? ActiveContent.Social : ActiveContent.Canvas
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }

  return (
    <Stack
      component={Paper}
      elevation={0}
      sx={{
        height: '100%',
        width: DRAWER_WIDTH,
        borderRadius: 3,
        // borderBottomLeftRadius: 0,
        // borderBottomRightRadius: 0,
        overflow: 'hidden'
      }}
      border={1}
      borderColor="divider"
      data-testid="SettingsDrawer"
    >
      <DrawerTitle
        data-testid="GoalDetails"
        title={selectedGoalUrl != null ? t('Goal Details') : t('Information')}
        onClose={onClose}
      />
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
    </Stack>
  )
}
