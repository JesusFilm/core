import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import EmailIcon from '@core/shared/ui/icons/Email'
import LinkIcon from '@core/shared/ui/icons/Link'

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

  function getIcon(typename?: string): ReactNode {
    switch (typename) {
      case 'LinkAction':
        return <LinkIcon sx={{ fontSize: 10 }} />
      case 'EmailAction':
        return <EmailIcon sx={{ fontSize: 10 }} />
      default:
        return <></>
    }
  }

  function getSourceConnection(block): boolean {
    return (
      block.action?.__typename === 'NavigateToBlockAction' &&
      block.action?.blockId != null
    )
  }

  let title = ''
  let icon: ReactNode
  let isSourceConnected = false
  switch (block.__typename) {
    case 'ButtonBlock':
      title =
        block.label != null && block.label !== '' ? block.label : t('Button')
      icon = getIcon(block.action?.__typename)
      isSourceConnected = getSourceConnection(block)
      break
    case 'FormBlock':
      title = t('Form')
      icon = getIcon(block.action?.__typename)
      isSourceConnected = getSourceConnection(block)
      break
    case 'RadioOptionBlock':
      title =
        block.label != null && block.label !== '' ? block.label : t('Option')
      icon = getIcon(block.action?.__typename)
      isSourceConnected = getSourceConnection(block)
      break
    case 'SignUpBlock':
      title = t('Subscribe')
      icon = getIcon(block.action?.__typename)
      isSourceConnected = getSourceConnection(block)
      break
    case 'TextResponseBlock':
      title = t('Feedback')
      icon = getIcon(block.action?.__typename)
      isSourceConnected = getSourceConnection(block)
      break
    case 'VideoBlock':
      title = block.video?.title?.[0]?.value ?? block.title ?? t('Video')
      icon = getIcon(block.action?.__typename)
      isSourceConnected = getSourceConnection(block)
      break
    case 'StepBlock':
      title = t('Next Step →')
      isSourceConnected = block.nextBlockId != null
      break
  }

  return (
    <BaseNode
      id={block.id}
      isSourceConnectable
      onSourceConnect={updateEdge}
      selected={selected}
      isSourceConnected={isSourceConnected}
    >
      <Box
        sx={{
          px: 3,
          gap: 1,
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
            fontWeight: 'bold',
            fontSize: 10
          }}
          variant="body2"
        >
          {title}
        </Typography>
        {icon}
      </Box>
    </BaseNode>
  )
}
