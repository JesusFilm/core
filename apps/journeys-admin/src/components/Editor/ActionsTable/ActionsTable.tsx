import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { SocialShareAppearance } from '../Drawer/SocialShareAppearance'
import { ActionsList } from './ActionsList'
import { ActionsBanner } from './ActionsBanner'

// TODO:
// create a custom component for action list?

// onClick - dispatch that opens the drawer, calls ActionDetails which accepts the currently selected action

// Fix actions array type - make a union type of all the blocks that includes action in it

export function ActionsTable(): ReactElement {
  const { journey } = useJourney()
  const {
    state: { steps },
    dispatch
  } = useEditor()
  // selectedAction state

  const actions = (journey?.blocks ?? [])
    .filter((b) => b.action != null)
    .map((b) => b.action)
    .filter((a) => ['LinkAction'].includes(a.__typename))

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
      {actions.length > 0 ? (
        <ActionsList actions={actions} />
      ) : (
        <Button variant="contained" onClick={onStartClick}>
          Start
        </Button>
      )}
    </Stack>
  )
}
