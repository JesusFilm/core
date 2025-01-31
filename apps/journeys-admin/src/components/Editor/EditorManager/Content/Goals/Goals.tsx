import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useMemo } from 'react'

import {
  GoalType,
  getLinkActionGoal
} from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GoalsBanner } from './GoalsBanner'
import { GoalsList } from './GoalsList'

export interface Goal {
  url: string
  count: number
  goalType: GoalType
}

export function Goals(): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()
  const { dispatch } = useEditor()

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

  return (
    <Stack
      gap={2}
      justifyContent={
        goals != null && goals.length > 0 ? 'flex-start' : 'center'
      }
      py={6}
      flexGrow={1}
      data-testid="Goals"
    >
      {journey != null &&
        (goals != null && goals.length > 0 ? (
          <GoalsList goals={goals} />
        ) : (
          <GoalsBanner />
        ))}
    </Stack>
  )
}
