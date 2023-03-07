import { ReactElement, useReducer } from 'react'
import Box from '@mui/material/Box'
import { Button } from '@core/journeys/ui/Button'
import { Canvas } from '../Canvas'
import { ControlPanel } from '../ControlPanel'
import { Drawer, DRAWER_WIDTH } from '../Drawer'
import { SocialPreview } from '../SocialPreview/SocialPreview'

interface JourneyEditContentState {
  component: string
}

interface JourneyEditContentAction {
  type: string
}

export const reducer = (
  state: JourneyEditContentState,
  action: JourneyEditContentAction
): JourneyEditContentState => {
  switch (action.type) {
    case 'JourneyEditSocialPreview':
      return {
        ...state,
        component: 'socialPreview'
      }
    default:
      return {
        ...state,
        component: 'canvas'
      }
  }
}

// This component is tested in Editor
export function JourneyEdit(): ReactElement {
  const [state, dispatch] = useReducer(reducer, { component: 'canvas' })
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
            <button
              onClick={() => dispatch({ type: 'JourneyEditSocialPreview' })}
            >
              <span>test</span>
            </button>

            {
              {
                canvas: <Canvas />,
                socialPreview: <SocialPreview />
              }[state.component]
            }
          </Box>
        </Box>
        <ControlPanel />
      </Box>
      <Drawer />
    </>
  )
}
