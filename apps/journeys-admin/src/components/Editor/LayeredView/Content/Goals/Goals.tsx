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
import { Box } from '@mui/material'

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
  const hasGoals = goals != null && goals.length > 0
  console.log('hasGoals', hasGoals)

  return (
    <>
      {journey != null &&
        (hasGoals ? (
          <Stack
            width="670px"
            direction="column"
            data-testid="Goals"
            sx={{
              height: '100%',
              mr: 5,
              backgroundColor: 'white',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Stack
              direction="column"
              sx={{
                height: '100%',
                py: 6,
                overflow: 'hidden'
              }}
            >
              <GoalsList goals={goals} />
            </Stack>
          </Stack>
        ) : (
          <Box
            width="670px"
            data-testid="Goals"
            sx={{
              mr: 5,
              backgroundColor: 'white',
              borderRadius: 3,
              alignSelf: 'center',
              py: 10
            }}
          >
            <GoalsBanner />
          </Box>
        ))}
    </>
  )
}
