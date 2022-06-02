import { ReactElement, useEffect } from 'react'
import { useEditor, useJourney } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { Canvas } from '../Canvas'
import { ControlPanel } from '../ControlPanel'
import { Drawer, DRAWER_WIDTH } from '../Drawer'

// This component is tested in Editor
export function JourneyEdit(): ReactElement {
  const {
    state: { steps },
    dispatch
  } = useEditor()
  const router = useRouter()
  const { journey } = useJourney()
  const stepId = router.query.stepId as string | undefined

  const selectedStep =
    stepId != null && steps != null
      ? steps.find(({ id }) => id === stepId)
      : undefined

  useEffect(() => {
    if (journey != null && selectedStep != null) {
      dispatch({
        type: 'SetSelectedStepAction',
        step: selectedStep
      })
    }
  }, [journey, selectedStep, dispatch])

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
            <Canvas />
          </Box>
        </Box>
        <ControlPanel />
      </Box>
      <Drawer />
    </>
  )
}
