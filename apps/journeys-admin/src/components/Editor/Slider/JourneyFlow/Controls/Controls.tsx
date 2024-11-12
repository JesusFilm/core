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
        <ControlButton onClick={() => zoomIn()}>
          <Plus1 />
        </ControlButton>
      </Tooltip>
      <Tooltip title={t('Zoom out')} arrow placement="right">
        <ControlButton onClick={() => zoomOut()}>
          <Dash />
        </ControlButton>
      </Tooltip>
      <Tooltip title={t('Recenter')} arrow placement="right">
        <ControlButton onClick={() => fitView()}>
          <Maximise2 />
        </ControlButton>
      </Tooltip>
      <Tooltip title={t('Reset layout')} arrow placement="right">
        <ControlButton onClick={async () => await handleReset()}>
          <ArrowRefresh6Icon />
        </ControlButton>
      </Tooltip>
    </Control>
  )
}
