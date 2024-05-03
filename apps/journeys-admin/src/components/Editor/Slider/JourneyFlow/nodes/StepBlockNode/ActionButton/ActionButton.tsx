import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields as Block,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import { useNavigateToBlockActionUpdateMutation } from '../../../../../../../libs/useNavigateToBlockActionUpdateMutation'
import { BaseNode } from '../../BaseNode'

interface ActionButtonProps {
  block: TreeBlock<Block>
  step: TreeBlock<StepBlock>
}

export function ActionButton({ block, step }: ActionButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  let title = ''
  switch (block.__typename) {
    case 'ButtonBlock':
      title =
        block.label != null && block.label !== '' ? block.label : t('Button')
      break
    case 'FormBlock':
      title = t('Form')
      break
    case 'RadioOptionBlock':
      title =
        block.label != null && block.label !== '' ? block.label : t('Option')
      break
    case 'SignUpBlock':
      title = t('Subscribe')
      break
    case 'TextResponseBlock':
      title = t('Feedback')
      break
    case 'VideoBlock':
      title = block.video?.title?.[0]?.value ?? block.title ?? t('Video')
      break
  }

  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const { journey } = useJourney()

  async function handleSourceConnect(params: {
    target: string
  }): Promise<void> {
    if (journey == null) return

    await navigateToBlockActionUpdate(block, params.target)
  }

  return (
    <BaseNode
      id={block.id}
      isSourceConnectable
      onSourceConnect={handleSourceConnect}
      isTargetConnectable={false}
    >
      <Box
        sx={{
          borderRadius: 20,
          border: '1px solid grey',
          backgroundColor: '#eff2f5',
          width: 125,
          height: 28,
          px: 4,
          position: 'relative'
        }}
      >
        <Typography
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 10,
            lineHeight: '26px'
          }}
          variant="body2"
        >
          {title}
        </Typography>
      </Box>
    </BaseNode>
  )
}
