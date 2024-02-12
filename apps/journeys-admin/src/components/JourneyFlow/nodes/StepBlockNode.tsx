import Box from '@mui/material/Box'
import SvgIcon from '@mui/material/SvgIcon'
import sortBy from 'lodash/sortBy'
import { ReactElement } from 'react'
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
  BlockFields as Block,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../__generated__/BlockFields'
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

interface BlockIconProps {
  typename: Block['__typename']
}

function BlockIcon({ typename }: BlockIconProps): ReactElement {
  let background: string | undefined
  let Icon: typeof SvgIcon
  switch (typename) {
    case 'VideoBlock':
      background = 'linear-gradient(to bottom, #f89f4c, #de7818)'
      Icon = Play3Icon
      break
    case 'TextResponseBlock':
      background = 'linear-gradient(to bottom, #b849ec, #9415d1)'
      Icon = TextInput1Icon
      break
    case 'ButtonBlock':
      background = 'linear-gradient(to bottom, #4c9bf8, #1873de)'
      Icon = GitBranchIcon
      break
    case 'TypographyBlock':
      background = 'linear-gradient(to bottom, #00C3C3, #03a3a3)'
      Icon = AlignCenterIcon
      break
    case 'RadioQuestionBlock':
      background = 'linear-gradient(to bottom, #b849ec, #9415d1)'
      Icon = TextInput1Icon
      break
    default:
      Icon = FlexAlignBottom1Icon
  }

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
      <Icon fontSize="small" />
    </Box>
  )
}

function getPriorityBlock(card?: TreeBlock<CardBlock>): TreeBlock | undefined {
  if (card == null) return

  const children = sortBy(
    card.children.filter(({ id }) => card.coverBlockId !== id),
    (block) => {
      switch (block.__typename) {
        case 'VideoBlock':
          return 1
        case 'TextResponseBlock':
          return 2
        case 'ButtonBlock':
          return 3
        case 'RadioQuestionBlock':
          return 4
        case 'TypographyBlock':
          return 5
        default:
          return 6
      }
    }
  )
  return children[0]
}

interface CardMetadata {
  title?: string
  subtitle?: string
  description?: string
  priorityBlock?: TreeBlock
  bgImage?: string
}

function getCardMetadata(card?: TreeBlock<CardBlock>): CardMetadata {
  if (card == null) return {}

  const priorityBlock = getPriorityBlock(card)
  const bgImage = getBackgroundImage(card)

  // if priority block is video

  // set language as subtitle
  // set video title as title
  // set duration as the description

  // else get the title from typography
  // get the subtitle

  return { priorityBlock, bgImage }
}

export function StepBlockNode({
  data: { steps, ...step }
}: NodeProps<StepBlockNodeData>): ReactElement {
  const card = step?.children[0] as TreeBlock<CardBlock> | undefined
  const { title, subtitle, description, priorityBlock, bgImage } =
    getCardMetadata(card)
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

  return (
    <BaseNode
      selected={selectedStep?.id === step.id}
      onSourceConnect={handleConnect}
      onClick={handleClick}
      icon={
        <Box
          sx={{
            height: '100%',
            flexShrink: 0,
            width: 50,
            border: '1px solid white',
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
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
            <BlockIcon typename={priorityBlock.__typename} />
          )}
        </Box>
      }
      title={title}
      subtitle={subtitle}
      description={description}
    />
  )
}
