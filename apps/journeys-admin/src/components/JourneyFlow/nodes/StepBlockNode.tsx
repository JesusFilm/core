import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { TOptions } from 'i18next'
import sortBy from 'lodash/sortBy'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { getStepSubtitle } from '@core/journeys/ui/getStepSubtitle'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import GitBranchIcon from '@core/shared/ui/icons/GitBranch'
import Play3Icon from '@core/shared/ui/icons/Play3'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import {
  BlockFields as Block,
  BlockFields_CardBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { useStepBlockNextBlockUpdateMutation } from '../../../libs/useStepBlockNextBlockUpdateMutation'

import { ACTION_NODE_HEIGHT, ACTION_NODE_HEIGHT_GAP } from './ActionNode'
import { BaseNode } from './BaseNode'

export const STEP_NODE_WIDTH = 200
export const STEP_NODE_HEIGHT = 76
export const STEP_NODE_WIDTH_GAP = 200
export const STEP_NODE_HEIGHT_GAP =
  ACTION_NODE_HEIGHT + ACTION_NODE_HEIGHT_GAP + 43

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

function getCardMetadata(
  card: TreeBlock<BlockFields_CardBlock> | undefined,
  steps: Array<TreeBlock<StepBlock>>,
  step: TreeBlock<StepBlock>,
  t: (str: string, options?: TOptions) => string
): CardMetadata {
  if (card == null) return {}

  const priorityBlock = getPriorityBlock(card)
  const bgImage = getBackgroundImage(card)

  // if priority block is video
  if (priorityBlock?.__typename === 'VideoBlock') {
    const title = priorityBlock.title !== null ? priorityBlock.title : undefined
    console.log(priorityBlock)
    const subtitle =
      priorityBlock.startAt !== null && priorityBlock.endAt !== null
        ? secondsToTimeFormat(priorityBlock.startAt, { trimZeroes: true }) +
          '-' +
          secondsToTimeFormat(priorityBlock.endAt, { trimZeroes: true })
        : undefined

    const description = 'English' // priorityBlock.video?.variant !== null ? String(priorityBlock.video?.variant) : undefined

    const bgImage =
      priorityBlock.image !== null ? priorityBlock.image : undefined

    return { title, subtitle, description, priorityBlock, bgImage }
  } else {
    const title = getStepHeading(step.id, step.children, steps, t)

    const subtitle = getStepSubtitle(step.id, step.children, steps, t)
    return { title, subtitle, priorityBlock, bgImage }
  }
}

export function StepBlockNode({
  data: { steps, ...step }
}: NodeProps<StepBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const card = step?.children[0] as TreeBlock<CardBlock> | undefined
  const { title, subtitle, description, priorityBlock, bgImage } =
    getCardMetadata(card, steps, step, t)
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()

  const {
    state: { selectedStep, journeyEditContentComponent },
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
      isTargetConnectable
      isSourceConnectable="arrow"
      selected={
        journeyEditContentComponent === ActiveJourneyEditContent.Canvas &&
        selectedStep?.id === step.id
      }
      onSourceConnect={handleConnect}
    >
      {({ selected }) => (
        <Box onClick={handleClick} sx={{ height: '150%', overflow: 'visible' }}>
          <Card
            sx={{
              borderRadius: 2,
              outline: '2px solid',
              outlineColor: (theme) =>
                selected === true
                  ? theme.palette.primary.main
                  : selected === 'descendant'
                  ? theme.palette.divider
                  : 'transparent',
              outlineOffset: '5px'
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyItems: 'center',
                width: STEP_NODE_WIDTH,
                height: STEP_NODE_HEIGHT,
                gap: 2,
                margin: 0,
                padding: 0,
                borderRadius: 1,
                paddingBottom: '0px !important'
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  flexShrink: 0,
                  width: 50,
                  border: '1px solid white',
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: card?.backgroundColor ?? 'background.default',
                  backgroundImage:
                    bgImage != null ? `url(${bgImage})` : undefined
                }}
              >
                {priorityBlock != null && (
                  <BlockIcon typename={priorityBlock.__typename} />
                )}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  width: STEP_NODE_WIDTH,
                  height: STEP_NODE_HEIGHT,
                  margin: 0,
                  padding: 2
                }}
              >
                <Typography
                  sx={{
                    display: '-webkit-box',
                    '-webkit-box-orient': 'vertical',
                    '-webkit-line-clamp': '1',
                    overflow: 'hidden',
                    padding: 0,
                    fontSize: 9,
                    height: 'auto',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignSelf: 'flex-start',
                    marginBottom: 1,
                    lineHeight: 1.3,
                    alignItems: 'flex-end',
                    color: '#444451'
                  }}
                >
                  {description !== '' ? description : ''}
                </Typography>
                <Typography
                  sx={{
                    display: '-webkit-box',
                    '-webkit-box-orient': 'vertical',
                    '-webkit-line-clamp': '2',
                    overflow: 'hidden',
                    padding: 0,
                    fontSize: 11,
                    fontWeight: 'bold',
                    height: 'auto',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignSelf: 'flex-start',
                    marginBottom: 1,
                    lineHeight: 1.3,
                    alignItems: 'flex-end',
                    color: '#26262E'
                  }}
                >
                  {title !== '' ? (
                    title
                  ) : (
                    <Skeleton
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
                    justifyContent: 'top',
                    color: '#444451',
                    overflow: 'hidden',
                    paddingBottom: '1px'
                  }}
                >
                  {title !== '' ? (
                    subtitle
                  ) : (
                    <Skeleton
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
        </Box>
      )}
    </BaseNode>
  )
}
