import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import GitBranchIcon from '@core/shared/ui/icons/GitBranch'
import Play3Icon from '@core/shared/ui/icons/Play3'
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

interface BlockIconProps {
  background: string
  icon: ReactNode
}
function BlockIcon({ background, icon }: BlockIconProps): ReactElement {
  return (
    <Box
      sx={{
        borderRadius: 20,
        height: 30,
        width: 30,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        background
      }}
    >
      {icon}
    </Box>
  )
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
} {
  switch (blockType) {
    case 'VideoBlock':
      return {
        icon: (
          <BlockIcon
            background="linear-gradient(to bottom, #f89f4c, #de7818)"
            icon={<Play3Icon fontSize="small" />}
          />
        )
      }

    case 'TextResponseBlock':
      return {
        icon: (
          <BlockIcon
            background="linear-gradient(to bottom, #b849ec, #9415d1)"
            icon={<TextInput1Icon fontSize="small" />}
          />
        )
      }

    case 'ButtonBlock':
      return {
        icon: (
          <BlockIcon
            background="linear-gradient(to bottom, #4c9bf8, #1873de)"
            icon={<GitBranchIcon fontSize="small" />}
          />
        )
      }
    case 'TypographyBlock':
      return {
        icon: (
          <BlockIcon
            background="linear-gradient(to bottom, #00C3C3, #03a3a3)"
            icon={<AlignCenterIcon fontSize="small" />}
          />
        )
      }

    case 'RadioQuestionBlock':
      return {
        icon: (
          <BlockIcon
            background="linear-gradient(to bottom, #b849ec, #9415d1)"
            icon={<TextInput1Icon fontSize="small" />}
          />
        )
      }

    default:
      return {
        icon: <FlexAlignBottom1Icon fontSize="small" />
      }
  }
}

function hasBlockOfType(step, blockType): boolean {
  return step?.children[0].children.some(
    (child) => child.__typename === blockType
  )
}

export function StepBlockNode({
  data: { steps, ...step }
}: NodeProps<StepBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { title, subtitle } = getStepHeading(step.id, step.children, steps, t)
  const videoStartToEnd = '0:00 - 99:99'
  const language = 'Eastern European Arabic language'

  const card = step.children.find((card) => card.__typename === 'CardBlock') as
    | TreeBlock<CardBlock>
    | undefined
  const bgImage = getBackgroundImage(card)
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
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
    : hasBlockOfType(step, 'ButtonBlock')
    ? 'ButtonBlock'
    : hasBlockOfType(step, 'RadioQuestionBlock')
    ? 'RadioQuestionBlock'
    : hasBlockOfType(step, 'TypographyBlock')
    ? 'TypographyBlock'
    : 'DefaultBlock'

  const { icon } = getIconAndColorForBlockType(blockType)
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
              width: 56,
              left: 0,
              margin: 0,
              borderLeft: '1px solid white',
              borderTop: '1px solid white',
              borderBottom: '1px solid white',
              borderRadius: '8px 0 0 8px ',
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
          <Box
            sx={{
              height: '100%',
              flexShrink: 0,
              width: 50,
              left: 0,
              margin: 0,
              borderLeft: '1px solid white',
              borderTop: '1px solid white',
              borderBottom: '1px solid white',
              borderRadius: '8px 0 0 8px ',
              backgroundColor: '#efefef',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}
          />
        )
      }
      title={title}
      language={language}
      subtitle={subtitle}
      blockType={blockType}
      videoStartToEnd={videoStartToEnd}
    />
  )
}
