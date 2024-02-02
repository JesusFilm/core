import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { useStepBlockNextBlockUpdateMutation } from '../../../libs/useStepBlockNextBlockUpdateMutation'

import { BaseNode } from './BaseNode'

export interface StepBlockNodeData extends TreeBlock<StepBlock> {
  steps: Array<TreeBlock<StepBlock>>
}

function getBackgroundImage(card?: TreeBlock<CardBlock>): string | undefined {
  if (card == null) return

  let bgImage: string | undefined

  const coverBlock = card.children.find(
    (block) =>
      block.id === card.coverBlockId &&
      (block.__typename === 'ImageBlock' || block.__typename === 'VideoBlock')
  ) as TreeBlock | undefined

  if (coverBlock?.__typename === 'VideoBlock') {
    bgImage =
      (coverBlock.source !== VideoBlockSource.youTube &&
      coverBlock.source !== VideoBlockSource.cloudflare
        ? // Use posterBlockId image or default poster image on video
          coverBlock?.posterBlockId != null
          ? (
              coverBlock.children.find(
                (block) =>
                  block.id === coverBlock.posterBlockId &&
                  block.__typename === 'ImageBlock'
              ) as TreeBlock<ImageBlock>
            ).src
          : coverBlock?.video?.image
        : // Use Youtube or Cloudflare set poster image
          coverBlock?.image) ?? undefined
  } else if (coverBlock?.__typename === 'ImageBlock') {
    bgImage = coverBlock?.src ?? undefined
  }

  return bgImage
}

function getIconAndColorForBlockType(blockType: string): {
  icon: React.ReactNode
  color: string
} {
  switch (blockType) {
    case 'VideoBlock':
      return {
        icon: (
          <Box>
            <PlayCircleFilledRoundedIcon
              fontSize="large"
              sx={{ marginTop: 1 }}
            />
          </Box>
        ),
        color: '#e07a1b'
      }

    case 'TextResponseBlock':
      return {
        icon: (
          <Box
            sx={{
              borderRadius: 20,
              height: 30,
              width: 30,
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to bottom, #b849ec, #9415d1)'
            }}
          >
            {' '}
          </Box>
        ),
        color: '#ae2eea'
      }
    case 'RadioOptionBlock':
      return {
        icon: <TextInput1Icon fontSize="large" />,
        color: 'green'
      }
    case 'ButtonBlock':
      return {
        icon: (
          <Box
            sx={{
              borderRadius: 20,
              height: 30,
              width: 30,
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to bottom, #73acf0, #1873de)'
            }}
          >
            {' '}
          </Box>
        ),
        color: '#368ff9'
      }
    case 'FormBlock':
      return {
        icon: (
          <Box
            sx={{
              borderRadius: 20,
              height: 30,
              width: 30,
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to bottom, #24c5c5, #03a3a3)'
            }}
          >
            {' '}
          </Box>
        ),
        color: '#ae2eea'
      }
    default:
      return {
        icon: <FlexAlignBottom1Icon fontSize="large" />,
        color: 'red'
      }
  }
}

function hasBlockOfType(step, blockType): boolean {
  return step.children[0].children.some(
    (child) => child.__typename === blockType
  )
}

export function StepBlockNode({
  data: { steps, ...step }
}: NodeProps<StepBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const title = getStepHeading(step.id, step.children, steps, t)
  const card = step.children.find((card) => card.__typename === 'CardBlock') as
    | TreeBlock<CardBlock>
    | undefined
  const bgImage = getBackgroundImage(card)
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  console.log(steps)
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { journey } = useJourney()

  async function handleConnect(params): Promise<void> {
    if (journey == null) return

    await stepBlockNextBlockUpdate({
      variables: {
        id: params.source,
        journeyId: journey.id,
        input: {
          nextBlockId: params.target
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id: params.source,
          __typename: 'StepBlock',
          nextBlockId: params.target
        }
      }
    })
  }

  function handleClick(): void {
    dispatch({ type: 'SetSelectedStepAction', step })
  }

  const blockType = hasBlockOfType(step, 'VideoBlock')
    ? 'VideoBlock'
    : hasBlockOfType(step, 'TextResponseBlock')
    ? 'TextResponseBlock'
    : hasBlockOfType(step, 'FormBlock')
    ? 'FormBlock'
    : hasBlockOfType(step, 'ButtonBlock')
    ? 'ButtonBlock'
    : 'DefaultBlock'

  const { icon, color } = getIconAndColorForBlockType(blockType)

  return (
    <BaseNode
      selected={selectedStep?.id === step.id}
      onSourceConnect={handleConnect}
      onClick={handleClick}
      icon={
        card?.backgroundColor != null || bgImage != null ? (
          <Box
            sx={{
              height: '100%',
              flexShrink: 0,
              width: 50,
              left: 0,
              margin: 0,
              borderRadius: 0,
              bgcolor: card?.backgroundColor,
              backgroundImage: bgImage != null ? `url(${bgImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                borderRadius: 20,
                height: '30%',
                width: '40%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
                background: 'white',
                opacity: hasBlockOfType(
                  steps[step.parentOrder ?? -1],
                  blockType
                )
                  ? 1
                  : 0
              }}
            >
              {icon}
            </Box>
          </Box>
        ) : (
          <FlexAlignBottom1Icon />
        )
      }
      title={title}
    />
  )
}
