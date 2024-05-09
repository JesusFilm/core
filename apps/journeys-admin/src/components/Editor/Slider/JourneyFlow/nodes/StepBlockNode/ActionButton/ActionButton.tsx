import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields as Block } from '../../../../../../../../__generated__/BlockFields'
import { useUpdateEdge } from '../../../libs/useUpdateEdge'
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
  const updateEdge = useUpdateEdge()

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
      title = t('Next Step →')
      isSourceConnected = block.nextBlockId != null
      break
  }

  async function handleSourceConnect(params: {
    source: string
    sourceHandle: string
    target: string
  }): Promise<void> {
    const { source, sourceHandle, target } = params
    void updateEdge(source, sourceHandle, target)
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
          opacity: selected ? 1 : 0.7,
          margin: 0,
          borderTop: (theme) => `1px solid ${theme.palette.secondary.dark}1A`,
          height: ACTION_BUTTON_HEIGHT,
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Typography
          align="left"
          noWrap
          sx={{
            px: 3,
            fontWeight: 'bold',
            fontSize: 10
          }}
          variant="body2"
        >
          {title}
        </Typography>
      </Box>
    </BaseNode>
  )
}
