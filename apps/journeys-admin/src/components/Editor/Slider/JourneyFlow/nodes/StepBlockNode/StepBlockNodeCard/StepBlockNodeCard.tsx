import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import { StepBlockNodeIcon } from '../StepBlockNodeIcon'
import { getCardMetadata } from '../libs/getCardMetadata'
import { STEP_NODE_CARD_HEIGHT, STEP_NODE_CARD_WIDTH } from '../libs/sizes'

interface StepBlockNodeCardProps {
  step: TreeBlock<StepBlock>
  selected: boolean
}

export function StepBlockNodeCard({
  step,
  selected
}: StepBlockNodeCardProps): ReactElement {
  const {
    state: { selectedStep, showAnalytics },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')

  const card = step?.children[0] as TreeBlock<CardBlock> | undefined
  const {
    title,
    subtitle,
    description,
    priorityBlock,
    bgImage,
    hasMultipleActions
  } = getCardMetadata(card)

  function handleClick(): void {
    if (selectedStep?.id === step?.id && showAnalytics !== true) {
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: selectedStep
      })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        selectedAttributeId: `${selectedStep?.id ?? ''}-next-block`
      })
    } else {
      dispatch({ type: 'SetSelectedStepAction', selectedStep: step })
    }
  }

  return (
    <Card
      data-testid="StepBlockNodeCard"
      elevation={selected ? 6 : 1}
      title={t('Click to edit or drag')}
      onClick={handleClick}
      sx={{
        opacity: showJourneyFlowAnalytics ? 0.8 : 1,
        boxShadow: showJourneyFlowAnalytics ? 'none' : 3,
        backgroundColor: showJourneyFlowAnalytics
          ? 'transparent'
          : 'background.paper',
        width: STEP_NODE_CARD_WIDTH,
        m: 1.5,
        '&:hover': {
          boxShadow: selected ? 6 : 3
        }
      }}
    >
      <CardContent
        data-testid="StepBlock"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: STEP_NODE_CARD_WIDTH,
          height: STEP_NODE_CARD_HEIGHT,
          borderRadius: 1,
          p: 0,
          '&:last-child': {
            pb: 0
          }
        }}
      >
        <Box
          data-testid="CardIconBackground"
          sx={{
            height: '100%',
            width: 80,
            borderBottomLeftRadius: 4,
            borderTopLeftRadius: 4,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: card?.backgroundColor ?? 'background.default',
            backgroundImage: bgImage != null ? `url(${bgImage})` : undefined
          }}
        >
          {priorityBlock != null && (
            <StepBlockNodeIcon
              typename={priorityBlock.__typename}
              showMultiIcon={hasMultipleActions}
            />
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: STEP_NODE_CARD_WIDTH,
            height: STEP_NODE_CARD_HEIGHT,
            padding: 2
          }}
        >
          {Boolean(description) && (
            <Typography
              sx={{
                display: '-webkit-box',
                '-webkit-box-orient': 'vertical',
                '-webkit-line-clamp': '1',
                overflow: 'hidden',
                fontSize: 9
              }}
            >
              {description !== '' ? description : ''}
            </Typography>
          )}
          <Typography
            gutterBottom
            sx={{
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              '-webkit-line-clamp': '2',
              overflow: 'hidden',
              fontSize: 11,
              fontWeight: 'bold',
              alignSelf: 'flex-start',
              lineHeight: 1.3
            }}
          >
            {title != null && title !== '' ? (
              title
            ) : (
              <Skeleton
                data-testid="StepBlockNodeCardTitleSkeleton"
                animation={false}
                sx={{
                  height: 16,
                  width: 117,
                  borderRadius: 1,
                  color: 'background.paper'
                }}
              />
            )}
          </Typography>
          <Typography
            sx={{
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              '-webkit-line-clamp': '2',
              fontSize: 10,
              lineHeight: '1.2',
              overflow: 'hidden'
            }}
          >
            {(subtitle != null && subtitle !== '') || title != null ? (
              subtitle
            ) : (
              <Skeleton
                data-testid="StepBlockNodeCardSubtitleSkeleton"
                animation={false}
                sx={{
                  height: 16,
                  width: 95,
                  borderRadius: 1,
                  color: 'background.paper'
                }}
              />
            )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
