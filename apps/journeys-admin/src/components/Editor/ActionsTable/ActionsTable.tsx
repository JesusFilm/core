import Stack from '@mui/material/Stack'
import { ReactElement, useMemo } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ActionFields_LinkAction as LinkAction } from '../../../../__generated__/ActionFields'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../__generated__/BlockFields'

import { ActionsBanner } from './ActionsBanner'
import { ActionsList } from './ActionsList'

export interface Actions {
  url: string
  count: number
}

export function ActionsTable(): ReactElement {
  const { journey } = useJourney()
  const { dispatch } = useEditor()

  const actions = useMemo((): Actions[] => {
    const actionsMap = (journey?.blocks ?? [])
      .filter(
        (block) =>
          ((block as ButtonBlock).action as LinkAction)?.__typename ===
          'LinkAction'
      )
      .map((block) => (block as ButtonBlock).action as LinkAction)
      .reduce((counts, { url }) => {
        counts[url] = ((counts[url] ?? 0) as number) + 1
        return counts
      }, {})
    const actions = Object.entries(actionsMap).map(([url, count]) => ({
      url,
      count
    })) as Actions[]
    dispatch({ type: 'SetSelectedComponentAction', component: actions[0].url })
    return actions
  }, [journey?.blocks, dispatch])

  function handleSelect(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
  }

  return (
    <Stack
      gap={2}
      justifyContent={
        actions != null && actions.length > 0 ? 'flex-start' : 'center'
      }
      py={6}
      flexGrow={1}
      data-testid="EditorActionsTable"
      onClick={handleSelect}
    >
      {journey != null &&
        (actions != null && actions.length > 0 ? (
          <ActionsList actions={actions} />
        ) : (
          <ActionsBanner />
        ))}
    </Stack>
  )
}
