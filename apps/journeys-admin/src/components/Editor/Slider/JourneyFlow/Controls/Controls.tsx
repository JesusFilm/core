import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { Controls as Control, ControlButton, useReactFlow } from 'reactflow'

import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'
import Dash from '@core/shared/ui/icons/Dash'
import Maximise2 from '@core/shared/ui/icons/Maximise2'
import Plus1 from '@core/shared/ui/icons/Plus1'

interface ControlsProps {
  handleReset: (boolean?) => Promise<void>
}

export function Controls({ handleReset }: ControlsProps): ReactElement {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Control showInteractive={false} showFitView={false} showZoom={false}>
      <Tooltip title={t('Zoom in')} arrow placement="right">
        <Box>
          <ControlButton onClick={() => zoomIn()}>
            <Plus1 />
          </ControlButton>
        </Box>
      </Tooltip>
      <Tooltip title={t('Zoom out')} arrow placement="right">
        <Box>
          <ControlButton onClick={() => zoomOut()}>
            <Dash />
          </ControlButton>
        </Box>
      </Tooltip>
      <Tooltip title={t('Recenter')} arrow placement="right">
        <Box>
          <ControlButton onClick={() => fitView()}>
            <Maximise2 />
          </ControlButton>
        </Box>
      </Tooltip>
      <Tooltip title={t('Reset layout')} arrow placement="right">
        <Box>
          <ControlButton onClick={async () => await handleReset()}>
            <ArrowRefresh6Icon />
          </ControlButton>
        </Box>
      </Tooltip>
    </Control>
  )
}
