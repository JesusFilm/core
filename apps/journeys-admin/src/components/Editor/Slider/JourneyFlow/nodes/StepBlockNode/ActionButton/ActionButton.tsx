import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields as Block } from '../../../../../../../../__generated__/BlockFields'
import { useUpdateEdge } from '../../../libs/useUpdateEdge'
import { BaseNode } from '../../BaseNode'
import { ACTION_BUTTON_HEIGHT } from '../libs/sizes'

interface BlockUIProperties {
  title: string
  isSourceConnected: boolean
  typename?: string
}

interface ActionButtonProps {
  block: TreeBlock<Block>
  selected?: boolean
}

export function ActionButton({
  block,
  selected = false
}: ActionButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { showJourneyFlowAnalytics }
  } = useEditor()
  const updateEdge = useUpdateEdge()

  function getTitle(block, defaultTitle): string {
    if (block.label != null && block.label !== '') return block.label
    if (block.__typename === 'VideoBlock')
      return block.video?.title?.[0]?.value ?? block.title ?? t('Video')
    return defaultTitle
  }

  function extractTitleAndConnection(block, defaultTitle): BlockUIProperties {
    const isSourceConnected =
      block.action?.__typename === 'NavigateToBlockAction' &&
      block.action?.blockId != null
    const title = getTitle(block, defaultTitle)
    const typename = block.__typename

    return { title, isSourceConnected, typename }
  }

  function getTitleAndConnection(): BlockUIProperties {
    switch (block.__typename) {
      case 'ButtonBlock':
        return extractTitleAndConnection(block, t('Button'))
      case 'FormBlock':
        return extractTitleAndConnection(block, t('Form'))
      case 'RadioOptionBlock':
        return extractTitleAndConnection(block, t('Option'))
      case 'SignUpBlock':
        return extractTitleAndConnection(block, t('Subscribe'))
      case 'VideoBlock':
        return extractTitleAndConnection(block, t('Video'))
      case 'StepBlock':
        return extractTitleAndConnection(block, t('Default Next Step →'))
      default:
        return { title: '', isSourceConnected: false }
    }
  }

  const { title, isSourceConnected } = getTitleAndConnection()

  return (
    <BaseNode
      id={block.id}
      sourceHandle="show"
      onSourceConnect={updateEdge}
      selected={selected}
      isSourceConnected={isSourceConnected}
    >
      <Box
        data-testid={`ActionButton-${block.id}`}
        sx={{
          px: 3,
          opacity: selected ? 1 : 0.7,
          transition: (theme) => theme.transitions.create('opacity'),
          margin: 0,
          borderTop: (theme) =>
            `1px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
          height: ACTION_BUTTON_HEIGHT,
          width: '100%'
        }}
      >
        <Typography
          align="left"
          noWrap
          sx={{
            fontWeight: 'bold',
            fontSize: 10,
            lineHeight: `${ACTION_BUTTON_HEIGHT - 1}px`
          }}
          variant="body2"
        >
          {block.id}
        </Typography>
      </Box>
    </BaseNode>
  )
}
