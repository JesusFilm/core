import { gql, useLazyQuery } from '@apollo/client'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import CheckSquareBrokenIcon from '@core/shared/ui/icons/CheckSquareBroken'
import CheckSquareContainedIcon from '@core/shared/ui/icons/CheckSquareContained'
import CircleIcon from '@core/shared/ui/icons/Circle'
import CursorPointerIcon from '@core/shared/ui/icons/CursorPointer'
import DuplicateCardIcon from '@core/shared/ui/icons/DuplicateCard'
import Image3Icon from '@core/shared/ui/icons/Image3'
import Layout1Icon from '@core/shared/ui/icons/Layout1'
import Mail1Icon from '@core/shared/ui/icons/Mail1'
import MessageCircleIcon from '@core/shared/ui/icons/MessageCircle'
import Play1Icon from '@core/shared/ui/icons/Play1'
import SpaceHeightIcon from '@core/shared/ui/icons/SpaceHeight'
import Stars2Icon from '@core/shared/ui/icons/Stars'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'
import Type1Icon from '@core/shared/ui/icons/Type1'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import {
  GetJourneyBlockStats,
  GetJourneyBlockStatsVariables
} from '../../../../../../../__generated__/GetJourneyBlockStats'

export const GET_JOURNEY_BLOCK_STATS = gql`
  query GetJourneyBlockStats($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      blocks {
        id
        __typename
      }
    }
  }
`

interface BlockTypeConfig {
  label: string
  icon: ReactElement
}

const BLOCK_TYPE_CONFIG: Record<string, BlockTypeConfig> = {
  ButtonBlock: {
    label: 'Button',
    icon: <CursorPointerIcon />
  },
  CardBlock: {
    label: 'Card',
    icon: <DuplicateCardIcon />
  },
  IconBlock: {
    label: 'Icon',
    icon: <Stars2Icon />
  },
  ImageBlock: {
    label: 'Image',
    icon: <Image3Icon />
  },
  MultiselectBlock: {
    label: 'Multiselect',
    icon: <CheckSquareBrokenIcon />
  },
  MultiselectOptionBlock: {
    label: 'Multiselect Option',
    icon: <CheckSquareContainedIcon />
  },
  RadioOptionBlock: {
    label: 'Radio Option',
    icon: <CircleIcon />
  },
  RadioQuestionBlock: {
    label: 'Radio Question',
    icon: <MessageCircleIcon />
  },
  SignUpBlock: {
    label: 'Sign Up',
    icon: <Mail1Icon />
  },
  SpacerBlock: {
    label: 'Spacer',
    icon: <SpaceHeightIcon />
  },
  StepBlock: {
    label: 'Step',
    icon: <Layout1Icon />
  },
  TextResponseBlock: {
    label: 'Text Response',
    icon: <TextInput1Icon />
  },
  TypographyBlock: {
    label: 'Typography',
    icon: <Type1Icon />
  },
  VideoBlock: {
    label: 'Video',
    icon: <VideoOnIcon />
  },
  VideoTriggerBlock: {
    label: 'Video Trigger',
    icon: <Play1Icon />
  }
}

interface BlockStatsDialogProps {
  id: string
  title: string
  open: boolean
  onClose: () => void
}

export function BlockStatsDialog({
  id,
  title,
  open,
  onClose
}: BlockStatsDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [loadBlockStats, { data, loading }] = useLazyQuery<
    GetJourneyBlockStats,
    GetJourneyBlockStatsVariables
  >(GET_JOURNEY_BLOCK_STATS)

  useEffect(() => {
    if (!open) return
    void loadBlockStats({ variables: { id } })
  }, [open, id, loadBlockStats])

  const blocks = data?.journey?.blocks ?? []

  const blockCounts = blocks.reduce<Record<string, number>>((acc, block) => {
    const typeName = block.__typename ?? 'Unknown'
    acc[typeName] = (acc[typeName] ?? 0) + 1
    return acc
  }, {})

  const totalCount = blocks.length

  const blockEntries = Object.entries(blockCounts).sort(([a], [b]) =>
    (BLOCK_TYPE_CONFIG[a]?.label ?? a).localeCompare(
      BLOCK_TYPE_CONFIG[b]?.label ?? b
    )
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title, closeButton: true }}
      maxWidth="xs"
      testId="BlockStatsDialog"
    >
      {loading ? (
        <CircularProgress
          data-testid="BlockStatsDialogLoading"
          sx={{ display: 'block', mx: 'auto', my: 2 }}
        />
      ) : (
        <>
          <List dense disablePadding>
            {blockEntries.map(([typeName, count]) => {
              const config = BLOCK_TYPE_CONFIG[typeName]
              return (
                <ListItem key={typeName} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36, color: 'secondary.main' }}>
                    {config?.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={config?.label ?? typeName}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {count}
                  </Typography>
                </ListItem>
              )
            })}
          </List>
          <Divider sx={{ my: 1 }} />
          <ListItem disableGutters>
            <ListItemText
              primary={t('Total')}
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
            <Typography
              variant="subtitle2"
              data-testid="BlockStatsTotalCount"
            >
              {totalCount}
            </Typography>
          </ListItem>
        </>
      )}
    </Dialog>
  )
}
