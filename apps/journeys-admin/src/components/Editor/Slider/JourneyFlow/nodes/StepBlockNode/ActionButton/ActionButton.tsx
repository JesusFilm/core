import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields as Block } from '../../../../../../../../__generated__/BlockFields'
import { useNavigateToBlockActionUpdateMutation } from '../../../../../../../libs/useNavigateToBlockActionUpdateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { BaseNode } from '../../BaseNode'
import { ACTION_BUTTON_HEIGHT } from '../libs/sizes'

interface ActionButtonProps {
  block: TreeBlock<Block>
  selected?: boolean
}

export function ActionButton({
  block,
  selected = false
}: ActionButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  let title = ''
  let isSourceConnected = false
  switch (block.__typename) {
    case 'ButtonBlock':
      title =
        block.label != null && block.label !== '' ? block.label : t('Button')
      isSourceConnected =
        block.action?.__typename === 'NavigateToBlockAction' &&
        block.action?.blockId != null
      break
    case 'FormBlock':
      title = t('Form')
      isSourceConnected =
        block.action?.__typename === 'NavigateToBlockAction' &&
        block.action?.blockId != null
      break
    case 'RadioOptionBlock':
      title =
        block.label != null && block.label !== '' ? block.label : t('Option')
      isSourceConnected =
        block.action?.__typename === 'NavigateToBlockAction' &&
        block.action?.blockId != null
      break
    case 'SignUpBlock':
      title = t('Subscribe')
      isSourceConnected =
        block.action?.__typename === 'NavigateToBlockAction' &&
        block.action?.blockId != null
      break
    case 'TextResponseBlock':
      title = t('Feedback')
      isSourceConnected =
        block.action?.__typename === 'NavigateToBlockAction' &&
        block.action?.blockId != null
      break
    case 'VideoBlock':
      title = block.video?.title?.[0]?.value ?? block.title ?? t('Video')
      isSourceConnected =
        block.action?.__typename === 'NavigateToBlockAction' &&
        block.action?.blockId != null
      break
    case 'StepBlock':
      title = 'Next Step →'
      isSourceConnected = block.nextBlockId != null
      break
  }

  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const { journey } = useJourney()

  async function handleSourceConnect(params: {
    target: string
    source: string
  }): Promise<void> {
    if (journey == null) return

    if (block.__typename === 'StepBlock') {
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
      isSourceConnectable
      onSourceConnect={handleSourceConnect}
      selected={selected}
      isSourceConnected={isSourceConnected}
    >
      <Box
        sx={{
          opacity: selected ? 1 : 0.5,
          margin: '0',
          border: '1px solid rgba(0,0,0,.1)',
          borderBottom: 'none',
          borderRight: 'none',
          borderLeft: 'none',
          height: ACTION_BUTTON_HEIGHT
        }}
      >
        <Typography
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            textAlign: 'left',
            paddingLeft: 3,
            paddingRight: 3,
            fontWeight: 'bold',
            fontSize: 10,
            lineHeight: '27px',
            color: 'black'
          }}
          variant="body2"
        >
          {title}
        </Typography>
      </Box>
    </BaseNode>
  )
}
