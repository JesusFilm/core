import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'
import {
  ControlButton,
  Controls as ControlItems,
  useReactFlow
} from 'reactflow'

import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'
import Dash from '@core/shared/ui/icons/Dash'
import Maximise2 from '@core/shared/ui/icons/Maximise2'
import Plus1 from '@core/shared/ui/icons/Plus1'

interface ControlsProps {
  handleReset: (boolean?) => Promise<void>
}

function ControlItem({ onClick, title, children }): ReactNode {
  return (
    <Tooltip title={title} arrow placement="right">
      <Box>
        <ControlButton onClick={onClick}>{children}</ControlButton>
      </Box>
    </Tooltip>
  )
}

export function Controls({ handleReset }: ControlsProps): ReactElement {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ControlItems showInteractive={false} showFitView={false} showZoom={false}>
      <ControlItem onClick={zoomIn} title={t('Zoom in')}>
        <Plus1 />
      </ControlItem>
      <ControlItem onClick={zoomOut} title={t('Zoom out')}>
        <Dash />
      </ControlItem>
      <ControlItem onClick={fitView} title={t('Recenter')}>
        <Maximise2 />
      </ControlItem>
      <ControlItem onClick={handleReset} title={t('Reset layout')}>
        <ArrowRefresh6Icon />
      </ControlItem>
    </ControlItems>
  )
}
