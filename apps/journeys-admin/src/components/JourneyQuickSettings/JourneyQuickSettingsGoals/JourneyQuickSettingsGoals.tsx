import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import { getLinkActionGoal } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import X2Icon from '@core/shared/ui/icons/X2'

import { Goal } from '../../Editor/Slider/Content/Goals/Goals'
import { GoalsList } from '../../Editor/Slider/Content/Goals/GoalsList'
import { ActionCards } from '../../Editor/Slider/Settings/GoalDetails/ActionCards'
import { ActionEditor } from '../../Editor/Slider/Settings/GoalDetails/ActionEditor'
import { ActionInformation } from '../../Editor/Slider/Settings/GoalDetails/ActionInformation'

export function JourneyQuickSettingsGoals(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [open, setOpen] = useState(false)
  const { journey } = useJourney()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    dispatch,
    state: { selectedGoalUrl }
  } = useEditor()

  const goals = useMemo((): Goal[] => {
    const blocks = (journey?.blocks ?? []) as unknown as Array<{
      action?: { url?: string }
    }>
    const goals = blocks
      .map((block) => block.action?.url)
      .reduce<Goal[]>((result, url?: string) => {
        if (url == null) return result
        const goal = result.find((goal) => goal.url === url)
        if (goal == null) {
          result.push({
            url,
            count: 1,
            goalType: getLinkActionGoal(url)
          })
        } else {
          goal.count++
        }
        return result
      }, [])

    if (smUp)
      dispatch({
        type: 'SetSelectedGoalUrlAction',
        selectedGoalUrl: goals[0]?.url
      })
    return goals
  }, [journey?.blocks, dispatch, smUp])

  function setSelectedAction(url: string): void {
    dispatch({ type: 'SetSelectedGoalUrlAction', selectedGoalUrl: url })
  }

  function handleClose(): void {
    setOpen(!open)
  }

  return (
    <Stack data-testid="JourneyQuickSettingsGoals">
      <GoalsList variant="minimal" goals={goals} onClose={handleClose} />
      <Drawer
        data-testid="GoalDetailsDrawer"
        open={open}
        onClose={handleClose}
        anchor="bottom"
        sx={{
          '& .MuiDrawer-paper': {
            borderRadius: 4,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            maxHeight: '90%'
          }
        }}
      >
        <AppBar position="static" color="default">
          <Toolbar
            sx={{
              minHeight: { xs: 64, sm: 48 },
              maxHeight: { xs: 64, sm: 48 }
            }}
          >
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {t('Goal Details')}
            </Typography>
            <IconButton
              data-testid="CloseGoalDetailsDrawerButton"
              onClick={handleClose}
              sx={{ display: 'inline-flex' }}
              edge="end"
            >
              <X2Icon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: { sm: 4 } }}>
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
      </Drawer>
    </Stack>
  )
}
