import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { isIOSTouchScreen as checkIsIOSTouchScreen } from '@core/shared/ui/deviceUtils'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import { getCardMetadata } from '../libs/getCardMetadata'
import { STEP_NODE_CARD_HEIGHT, STEP_NODE_CARD_WIDTH } from '../libs/sizes'
import { StepBlockNodeIcon } from '../StepBlockNodeIcon'

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
  const isIOSTouchScreen = checkIsIOSTouchScreen()
  const card = step?.children[0] as TreeBlock<CardBlock> | undefined
  const {
    title,
    subtitle,
    description,
    priorityBlock,
    bgImage,
    hasMultipleActions,
    priorityImage
  } = getCardMetadata(card)

  function handleClick(): void {
    if (selectedStep?.id === step?.id && showAnalytics !== true) {
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: selectedStep
      })
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        selectedAttributeId: `${selectedStep?.id ?? ''}-next-block`
      })
    } else {
      dispatch({ type: 'SetSelectedStepAction', selectedStep: step })
    }
  }
  const nodeBgImage = priorityImage ?? bgImage

  const conditionalStyles =
    showAnalytics === true
      ? {
          opacity: 0.8,
          bgcolor: 'transparent',
          boxShadow: 'none'
        }
      : {
          opacity: 1,
          bgcolor: 'background.paper',
          '&:hover': { boxShadow: selected ? 6 : 3 }
        }

  return (
    <Card
      data-testid="StepBlockNodeCard"
      elevation={selected ? 6 : 1}
      title={showAnalytics === true ? '' : t('Click to edit or drag')}
      // hover events and psuedo elements preventing onclicks from running on iOS devices see:
      // https://stackoverflow.com/questions/17710893/why-when-do-i-have-to-tap-twice-to-trigger-click-on-ios#:~:text=The%20simplest%20solution%20is%20not,triggered%20on%20the%20first%20tap.
      // see fig 6-4, https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html#//apple_ref/doc/uid/TP40006511-SW7
      onMouseEnter={() => {
        if (isIOSTouchScreen) handleClick()
      }}
      onClick={handleClick}
      sx={{
        width: STEP_NODE_CARD_WIDTH,
        m: 1.5,
        boxShadow: 3,
        ...conditionalStyles
      }}
    >
      {selectedStep?.id === step?.id &&
        showAnalytics !== true &&
        isIOSTouchScreen && (
          // this tap layer is needed to handle the second tap without the user having to double tap, see:
          // https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html#//apple_ref/doc/uid/TP40006511-SW7
          <Box
            data-testid="IPhoneSecondTapLayer"
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 2
            }}
            onMouseEnter={(e) => {
              if (isIOSTouchScreen) handleClick()
            }}
          />
        )}
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
            backgroundImage:
              nodeBgImage != null ? `url(${nodeBgImage})` : undefined
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
                fontSize: 9,
                lineHeight: 2
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
              lineHeight: 1.2,
              maxWidth: '125px',
              wordBreak: 'break-word'
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
              lineHeight: 1.2,
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
