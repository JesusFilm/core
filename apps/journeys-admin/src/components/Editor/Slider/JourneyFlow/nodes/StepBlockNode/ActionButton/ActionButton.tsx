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
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { BaseNode } from '../../BaseNode'

interface CustomBlock {
  __typename: 'CustomBlock'
  id: string
  label: string
}

interface ActionButtonProps {
  block: TreeBlock<Block> | CustomBlock
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
    case 'CustomBlock':
      title = `${block.label} >>`
      break
  }

  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const { journey } = useJourney()

  async function handleSourceConnect(params: {
    target: string
  }): Promise<void> {
    if (journey == null) return

    if (block.__typename === 'CustomBlock') {
      const targetId = params.target
      const sourceId = params.source
      if (journey == null || targetId == null || sourceId == null) return

      await stepBlockNextBlockUpdate({
        variables: {
          id: sourceId,
          journeyId: journey.id,
          input: {
            nextBlockId: targetId
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: sourceId,
            __typename: 'StepBlock',
            nextBlockId: targetId
          }
        }
      })
    } else {
      await navigateToBlockActionUpdate(block, params.target)
    }
  }

  return (
    <BaseNode
      id={block.id}
      isSourceConnectable="arrow"
      onSourceConnect={handleSourceConnect}
      isTargetConnectable={false}
    >
      <Box
        sx={{
          backgroundColor: '#EFEFEF',
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          border: '2px solid white',
          borderTop: 'none'
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
