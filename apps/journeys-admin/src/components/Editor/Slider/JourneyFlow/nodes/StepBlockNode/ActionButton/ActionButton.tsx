import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields as Block } from '../../../../../../../../__generated__/BlockFields'
import { useUpdateEdge } from '../../../libs/useUpdateEdge'
import { BaseNode, HandleVariant } from '../../BaseNode'
import { ACTION_BUTTON_HEIGHT } from '../libs/sizes'
import { useGetValueFromJourneyCustomizationString } from '@core/journeys/ui/useGetValueFromJourneyCustomizationString'

interface BlockUIProperties {
  title: string
  isSourceConnected: boolean
}

interface ActionButtonProps {
  stepId: string
  block: TreeBlock<Block>
  selected?: boolean
}

export function ActionButton({
  stepId,
  block,
  selected = false
}: ActionButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { showAnalytics, analytics }
  } = useEditor()
  const updateEdge = useUpdateEdge()

  function getTitle(block, defaultTitle): string {
    if (block.label != null && block.label !== '')
      return useGetValueFromJourneyCustomizationString(block.label)
    if (block.__typename === 'VideoBlock')
      return block.video?.title?.[0]?.value ?? block.title ?? t('Video')
    return defaultTitle
  }

  function extractTitleAndConnection(block, defaultTitle): BlockUIProperties {
    const isSourceConnected =
      block.action?.__typename === 'NavigateToBlockAction' &&
      block.action?.blockId != null
    const title = getTitle(block, defaultTitle)

    return { title, isSourceConnected }
  }

  function getTitleAndConnection(): BlockUIProperties {
    switch (block.__typename) {
      case 'ButtonBlock': {
        const defaultTitle = block.submitEnabled ? t('Submit') : t('Button')
        return extractTitleAndConnection(block, defaultTitle)
      }
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

  const total = analytics?.blockMap.get(block.id) ?? 0
  const blockEventTotal = analytics?.blockMap.get(block.id) ?? 0
  let percentage =
    blockEventTotal / (analytics?.stepMap.get(stepId)?.total ?? 0)
  if (Number.isNaN(percentage) || !Number.isFinite(percentage)) percentage = 0

  return (
    <BaseNode
      id={block.id}
      sourceHandle={
        showAnalytics === true ? HandleVariant.Disabled : HandleVariant.Shown
      }
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
          position: 'relative'
        }}
      >
        <Box
          sx={{
            opacity: 0.2,
            width: '100%',
            height: 'calc(100% - 2px)',
            position: 'absolute',
            left: 0,
            top: 1,
            display: 'flex'
          }}
        >
          <Box
            className="stats-overlay__bar"
            data-testid="AnalyticsOverlayBar"
            sx={{
              backgroundColor: 'info.main',
              position: 'relative',
              flexBasis: 0,
              flexShrink: '1px',
              transition: 'all 300ms ease',
              flexGrow: showAnalytics === true ? `${percentage}` : 0,
              borderRadius: '0 4px 4px 0'
            }}
          />
        </Box>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:hover': {
              '& .stats-overlay__event-count': {
                opacity: showAnalytics === true ? 1 : 0
              }
            }
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
            {title}
          </Typography>
          <Box
            className="stats-overlay__event-count"
            data-testid="AnalyticsEventCount"
            sx={{
              transition: 'opacity 200ms ease-in-out',
              borderRadius: 4,
              backgroundColor: 'background.paper',
              px: 1,
              py: 1,
              opacity: 0
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontSize: 12, fontWeight: 600, lineHeight: '14px' }}
            >
              {total}
            </Typography>
          </Box>
        </Box>
      </Box>
    </BaseNode>
  )
}
