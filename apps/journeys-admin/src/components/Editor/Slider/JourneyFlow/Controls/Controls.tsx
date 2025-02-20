import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'
import { Controls as Control, ControlButton, useReactFlow } from 'reactflow'

import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'
import Dash from '@core/shared/ui/icons/Dash'
import Maximise2 from '@core/shared/ui/icons/Maximise2'
import Plus1 from '@core/shared/ui/icons/Plus1'

interface ControlsProps {
  handleReset: (boolean?) => Promise<void>
}

interface ControlItemProps {
  onClick: () => void
  title: string
  icon: ReactNode
}

export function Controls({ handleReset }: ControlsProps): ReactElement {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Control showInteractive={false} showFitView={false} showZoom={false}>
      <ControlItem onClick={zoomIn} title={t('Zoom in')} icon={<Plus1 />} />
      <ControlItem onClick={zoomOut} title={t('Zoom out')} icon={<Dash />} />
      <ControlItem
        onClick={fitView}
        title={t('Recenter')}
        icon={<Maximise2 />}
      />
      <ControlItem
        onClick={async () => await handleReset(false)}
        title={t('Reset layout')}
        icon={<ArrowRefresh6Icon />}
      />
    </Control>
  )
}

function ControlItem({ onClick, title, icon }: ControlItemProps): ReactNode {
  return (
    <Tooltip title={title} arrow placement="right">
      <Box>
        <ControlButton onClick={onClick}>{icon}</ControlButton>
      </Box>
    </Tooltip>
  )
}
