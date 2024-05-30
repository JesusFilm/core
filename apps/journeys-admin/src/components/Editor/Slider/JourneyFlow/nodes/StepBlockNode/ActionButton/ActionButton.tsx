import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import EmailIcon from '@core/shared/ui/icons/Email'
import LinkIcon from '@core/shared/ui/icons/Link'

import { ActionFields as Action } from '../../../../../../../../__generated__/ActionFields'
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

  function getIcon(action?: Action | null): ReactNode {
    switch (action?.__typename) {
      case 'LinkAction':
        return (
          <Tooltip title={action.url} placement="left" arrow>
            <LinkIcon
              sx={{ fontSize: 10, position: 'absolute', left: -20, top: 7 }}
            />
          </Tooltip>
        )
      case 'EmailAction':
        return (
          <Tooltip title={action.email} placement="left" arrow>
            <EmailIcon
              sx={{ fontSize: 10, position: 'absolute', left: -20, top: 8 }}
            />
          </Tooltip>
        )
      default:
        return <></>
    }
  }

  function hasConnection(block): boolean {
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
      icon = getIcon(block.action)
      isSourceConnected = hasConnection(block)
      break
    case 'FormBlock':
      title = t('Form')
      icon = getIcon(block.action)
      isSourceConnected = hasConnection(block)
      break
    case 'RadioOptionBlock':
      title =
        block.label != null && block.label !== '' ? block.label : t('Option')
      icon = getIcon(block.action)
      isSourceConnected = hasConnection(block)
      break
    case 'SignUpBlock':
      title = t('Subscribe')
      icon = getIcon(block.action)
      isSourceConnected = hasConnection(block)
      break
    case 'TextResponseBlock':
      title = t('Feedback')
      icon = getIcon(block.action)
      isSourceConnected = hasConnection(block)
      break
    case 'VideoBlock':
      title = block.video?.title?.[0]?.value ?? block.title ?? t('Video')
      icon = getIcon(block.action)
      isSourceConnected = hasConnection(block)
      break
    case 'StepBlock':
      title = t('Default Next Step →')
      isSourceConnected = block.nextBlockId != null
      break
  }

  return (
    <BaseNode
      id={block.id}
      // TODO: set to true once action has been removed AND migration script run
      isSourceConnectable={block.__typename !== 'TextResponseBlock'}
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
        {icon}
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
          {title}
        </Typography>
      </Box>
    </BaseNode>
  )
}
