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
import { ActionsList } from './ActionsList'
import { ActionsBanner } from './ActionsBanner'

export function ActionsTable(): ReactElement {
  const { journey } = useJourney()

  const actions = (journey?.blocks ?? [])
    .filter((block) => ((block as ButtonBlock).action as LinkAction) != null)
    .map((block) => (block as ButtonBlock).action as LinkAction)
    .filter(
      (action, i, arr) =>
        ['LinkAction'].includes(action.__typename) &&
        arr.findIndex((x) => x.url === action.url) === i
    )

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
