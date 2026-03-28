import { gql, useLazyQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import BoxIcon from '@core/shared/ui/icons/Box'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import CheckSquareBrokenIcon from '@core/shared/ui/icons/CheckSquareBroken'
import CheckSquareContainedIcon from '@core/shared/ui/icons/CheckSquareContained'
import CircleIcon from '@core/shared/ui/icons/Circle'
import Cursor4Icon from '@core/shared/ui/icons/Cursor4'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Image3Icon from '@core/shared/ui/icons/Image3'
import LayoutScaleIcon from '@core/shared/ui/icons/LayoutScale'
import Play1Icon from '@core/shared/ui/icons/Play1'
import Presentation1Icon from '@core/shared/ui/icons/Presentation1'
import SpaceVerticalIcon from '@core/shared/ui/icons/SpaceVertical'
import Star2Icon from '@core/shared/ui/icons/Star2'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'
import Type1Icon from '@core/shared/ui/icons/Type1'
import UserProfileAddIcon from '@core/shared/ui/icons/UserProfileAdd'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import {
  GetJourneyBlockStats,
  GetJourneyBlockStatsVariables,
  GetJourneyBlockStats_blocks
} from '../../../../../../__generated__/GetJourneyBlockStats'

export const GET_JOURNEY_BLOCK_STATS = gql`
  query GetJourneyBlockStats($journeyId: ID!) {
    blocks(where: { journeyIds: [$journeyId] }) {
      ... on ButtonBlock {
        id
      }
      ... on CardBlock {
        id
      }
      ... on ImageBlock {
        id
      }
      ... on VideoBlock {
        id
      }
      ... on TypographyBlock {
        id
      }
      ... on RadioQuestionBlock {
        id
      }
      ... on RadioOptionBlock {
        id
      }
      ... on TextResponseBlock {
        id
      }
      ... on SignUpBlock {
        id
      }
      ... on SpacerBlock {
        id
      }
      ... on StepBlock {
        id
      }
      ... on VideoTriggerBlock {
        id
      }
      ... on GridContainerBlock {
        id
      }
      ... on GridItemBlock {
        id
      }
      ... on MultiselectBlock {
        id
      }
      ... on MultiselectOptionBlock {
        id
      }
      ... on IconBlock {
        id
      }
    }
  }
`

type BlockTypeName = GetJourneyBlockStats_blocks['__typename']

interface BlockTypeConfig {
  label: string
  icon: ReactElement
}

const blockTypeConfig: Record<BlockTypeName, BlockTypeConfig> = {
  StepBlock: { label: 'Step', icon: <Presentation1Icon color="secondary" /> },
  CardBlock: { label: 'Card', icon: <BoxIcon color="secondary" /> },
  ImageBlock: { label: 'Image', icon: <Image3Icon color="secondary" /> },
  VideoBlock: { label: 'Video', icon: <VideoOnIcon color="secondary" /> },
  TypographyBlock: {
    label: 'Typography',
    icon: <Type1Icon color="secondary" />
  },
  ButtonBlock: { label: 'Button', icon: <Cursor4Icon color="secondary" /> },
  RadioQuestionBlock: {
    label: 'Radio Question',
    icon: <CheckSquareBrokenIcon color="secondary" />
  },
  RadioOptionBlock: {
    label: 'Radio Option',
    icon: <CircleIcon color="secondary" />
  },
  TextResponseBlock: {
    label: 'Text Response',
    icon: <TextInput1Icon color="secondary" />
  },
  SignUpBlock: {
    label: 'Sign Up',
    icon: <UserProfileAddIcon color="secondary" />
  },
  SpacerBlock: {
    label: 'Spacer',
    icon: <SpaceVerticalIcon color="secondary" />
  },
  VideoTriggerBlock: {
    label: 'Video Trigger',
    icon: <Play1Icon color="secondary" />
  },
  GridContainerBlock: {
    label: 'Grid Container',
    icon: <Grid1Icon color="secondary" />
  },
  GridItemBlock: {
    label: 'Grid Item',
    icon: <LayoutScaleIcon color="secondary" />
  },
  MultiselectBlock: {
    label: 'Multiselect',
    icon: <CheckSquareContainedIcon color="secondary" />
  },
  MultiselectOptionBlock: {
    label: 'Multiselect Option',
    icon: <CheckContainedIcon color="secondary" />
  },
  IconBlock: { label: 'Icon', icon: <Star2Icon color="secondary" /> }
}

function countBlocksByType(
  blocks: GetJourneyBlockStats_blocks[]
): Map<BlockTypeName, number> {
  const counts = new Map<BlockTypeName, number>()
  for (const block of blocks) {
    const current = counts.get(block.__typename) ?? 0
    counts.set(block.__typename, current + 1)
  }
  return counts
}

export interface BlockStatsDialogProps {
  journeyId: string
  journeyTitle: string
  open: boolean
  onClose: () => void
}

export function BlockStatsDialog({
  journeyId,
  journeyTitle,
  open,
  onClose
}: BlockStatsDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [loadBlockStats, { data, loading }] = useLazyQuery<
    GetJourneyBlockStats,
    GetJourneyBlockStatsVariables
  >(GET_JOURNEY_BLOCK_STATS, {
    variables: { journeyId }
  })

  useEffect(() => {
    if (open) {
      void loadBlockStats()
    }
  }, [open, loadBlockStats])

  const counts = data != null ? countBlocksByType(data.blocks) : new Map()
  const totalCount = data != null ? data.blocks.length : 0

  const blockTypeOrder: BlockTypeName[] = [
    'StepBlock',
    'CardBlock',
    'ImageBlock',
    'VideoBlock',
    'TypographyBlock',
    'ButtonBlock',
    'RadioQuestionBlock',
    'RadioOptionBlock',
    'TextResponseBlock',
    'SignUpBlock',
    'SpacerBlock',
    'VideoTriggerBlock',
    'GridContainerBlock',
    'GridItemBlock',
    'MultiselectBlock',
    'MultiselectOptionBlock',
    'IconBlock'
  ]

  const visibleTypes = blockTypeOrder.filter(
    (typename) => (counts.get(typename) ?? 0) > 0
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: journeyTitle,
        closeButton: true
      }}
      loading={loading}
      testId="BlockStatsDialog"
    >
      <List disablePadding>
        {visibleTypes.map((typename) => {
          const config = blockTypeConfig[typename]
          const count = counts.get(typename) ?? 0
          return (
            <ListItem key={typename} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>{config.icon}</ListItemIcon>
              <ListItemText primary={t(config.label)} />
              <Typography variant="body2" color="text.secondary">
                {count}
              </Typography>
            </ListItem>
          )
        })}
        {visibleTypes.length === 0 && !loading && (
          <ListItem disableGutters>
            <ListItemText
              primary={t('No blocks found')}
              sx={{ color: 'text.secondary' }}
            />
          </ListItem>
        )}
      </List>
      {data != null && (
        <>
          <Divider sx={{ mt: 1 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: 'right' }}
          >
            {t('Total: {{count}}', { count: totalCount })}
          </Typography>
        </>
      )}
    </Dialog>
  )
}
