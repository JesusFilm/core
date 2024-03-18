import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { ActionBlock } from '../../libs/isActionBlock'
import { BaseNode } from '../BaseNode'

import { ActionButton } from './ActionButton'
import { getCardMetadata } from './libs/getCardMetadata'
import { StepBlockNodeIcon } from './StepBlockNodeIcon'

export const STEP_NODE_WIDTH = 200
export const STEP_NODE_HEIGHT = 76
export const STEP_NODE_WIDTH_GAP = 200
export const STEP_NODE_HEIGHT_GAP = 150

export interface StepBlockNodeData extends TreeBlock<StepBlock> {
  steps: Array<TreeBlock<StepBlock>>
  actionBlocks: ActionBlock[]
}

export function StepBlockNode({
  data: { steps, actionBlocks, ...step }
}: NodeProps<StepBlockNodeData>): ReactElement {
  const card = step?.children[0] as TreeBlock<CardBlock> | undefined
  const { title, subtitle, description, priorityBlock, bgImage } =
    getCardMetadata(card)
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()

  const {
    state: { selectedStep, activeContent },
    dispatch
  } = useEditor()
  const { journey } = useJourney()

  async function handleSourceConnect(params): Promise<void> {
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
    dispatch({ type: 'SetSelectedStepAction', selectedStep: step })
  }

  return (
    <BaseNode
      id={step.id}
      isTargetConnectable
      isSourceConnectable="arrow"
      selected={
        activeContent === ActiveContent.Canvas && selectedStep?.id === step.id
      }
      onSourceConnect={handleSourceConnect}
      sourceHandleProps={{
        sx: {
          bottom: 35
        }
      }}
    >
      {({ selected }) => (
        <Stack alignItems="center" spacing={3}>
          <Card
            sx={{
              borderRadius: 2,
              border: (theme) =>
                `2px solid ${
                  selected === true ? theme.palette.primary.main : 'white'
                }`,
              width: 190
            }}
            onClick={handleClick}
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
                  borderBottomLeftRadius: 6,
                  borderTopLeftRadius: 6,
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
                  <StepBlockNodeIcon typename={priorityBlock.__typename} />
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
                  {title != null && title !== '' ? (
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
                  {title != null && title !== '' ? (
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
          <Stack
            direction="row"
            spacing={2}
            sx={{
              height: 28
            }}
          >
            {actionBlocks.map((block) => (
              <ActionButton key={block.id} block={block} step={step} />
            ))}
          </Stack>
        </Stack>
      )}
    </BaseNode>
  )
}
