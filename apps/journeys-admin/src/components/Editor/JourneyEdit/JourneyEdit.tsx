import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import {
  useEditor,
  ActiveJourneyEditContent
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_ButtonBlock_action_LinkAction as LinkAction
} from '../../../../__generated__/BlockFields'
import { Canvas } from '../Canvas'
import { ControlPanel } from '../ControlPanel'
import { Drawer, DRAWER_WIDTH } from '../Drawer'
import { ActionsTable } from '../ActionsTable'

// This component is tested in Editor
export function JourneyEdit(): ReactElement {
  const {
    state: { journeyEditContentComponent }
  } = useEditor()
  const { journey } = useJourney()

  const actions = (journey?.blocks ?? [])
    .filter((block) => ((block as ButtonBlock).action as LinkAction) != null)
    .map((block) => (block as ButtonBlock).action as LinkAction)
    .filter(
      (action, i, arr) =>
        ['LinkAction'].includes(action.__typename) &&
        arr.findIndex((x) => x.url === action.url) === i
    )

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 48px)',
          flexDirection: 'column',
          marginRight: { sm: `${DRAWER_WIDTH}px` }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.background.paper
          }}
        >
          <Box sx={{ my: 'auto' }}>
            {
              {
                [ActiveJourneyEditContent.Canvas]: <Canvas />,
                [ActiveJourneyEditContent.Action]: (
                  <ActionsTable actions={actions} />
                )
              }[journeyEditContentComponent]
            }
          </Box>
        </Box>
        <ControlPanel action={actions[0]} />
      </Box>
      <Drawer />
    </>
  )
}
