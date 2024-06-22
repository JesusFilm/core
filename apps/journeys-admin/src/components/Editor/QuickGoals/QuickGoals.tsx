import { ReactElement, useEffect, useMemo, useState } from 'react'

import {
  EditorProvider,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { transformer } from '@core/journeys/ui/transformer'

import { getLinkActionGoal } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { Goal } from '../Slider/Content/Goals/Goals'
import { GoalsList } from '../Slider/Content/Goals/GoalsList'
import { GoalDetails } from '../Slider/Settings/GoalDetails'
import { ActionCards } from '../Slider/Settings/GoalDetails/ActionCards'
import { ActionEditor } from '../Slider/Settings/GoalDetails/ActionEditor'
import { ActionInformation } from '../Slider/Settings/GoalDetails/ActionInformation'

interface QuickGoalsProps {
  journey?: Journey
}

/**
 * Editor initializes the journey provider and editor provider states which all
 * descendants are able to make use of via useJourney and useEditor
 * respectively.
 */
export function QuickGoals({ journey }: QuickGoalsProps): ReactElement {
  const [open, setOpen] = useState(true)
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

  useEffect(() => {
    setOpen(selectedGoalUrl != null)
  }, [selectedGoalUrl])

  function setSelectedAction(url: string): void {
    dispatch({ type: 'SetSelectedGoalUrlAction', selectedGoalUrl: url })
  }

  function onClose(): void {
    setOpen(false)
  }

  return (
    <Stack>
      <GoalsList variant="minimal" goals={goals} />
      <Drawer open={open} onClose={onClose} anchor="bottom">
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
      </Drawer>
    </Stack>
  )
}
