import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ActionFields_LinkAction as LinkAction } from '../../../../__generated__/ActionFields'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../__generated__/BlockFields'
import { SocialShareAppearance } from '../Drawer/SocialShareAppearance'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { ActionsList } from './ActionsList'
import { ActionsBanner } from './ActionsBanner'

export interface Actions {
  url: string
  count: number
}

export function ActionsTable(): ReactElement {
  const { journey } = useJourney()

  function countUrls(journey: Journey | undefined): Actions[] {
    const actions = (journey?.blocks ?? [])
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

    return Object.entries(actions).map(([url, count]) => ({
      url,
      count
    })) as Actions[]
  }

  const actions = countUrls(journey)

  const {
    state: { steps },
    dispatch
  } = useEditor()

  const onStartClick = (): void => {
    if (steps == null) return
    dispatch({ type: 'SetSelectedStepAction', step: steps[0] })
    dispatch({
      type: 'SetJourneyEditContentAction',
      component: ActiveJourneyEditContent.Canvas
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Social Share Appearance',
      children: <SocialShareAppearance />
    })
  }

  return (
    <Stack gap={2} justifyContent="center" alignItems="center">
      <ActionsBanner hasActions={actions.length > 0} />
      {actions != null && actions.length > 0 ? (
        <ActionsList actions={actions} />
      ) : (
        <Button variant="contained" onClick={onStartClick}>
          Start
        </Button>
      )}
    </Stack>
  )
}
