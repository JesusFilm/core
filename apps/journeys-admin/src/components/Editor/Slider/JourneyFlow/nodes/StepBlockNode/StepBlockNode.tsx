import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { NodeProps, OnConnect } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../__generated__/BlockFields'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { filterActionBlocks } from '../../libs/filterActionBlocks'
import { BaseNode } from '../BaseNode'

import { ActionButton } from './ActionButton'
import { getCardMetadata } from './libs/getCardMetadata'
import { StepBlockNodeIcon } from './StepBlockNodeIcon'
import { StepBlockNodeMenu } from './StepBlockNodeMenu'

export const STEP_NODE_WIDTH = 200
export const STEP_NODE_HEIGHT = 76
export const STEP_NODE_WIDTH_GAP = 200
export const STEP_NODE_HEIGHT_GAP = 150

export function StepBlockNode({ id }: NodeProps): ReactElement {
  const {
    state: { steps, selectedStep, activeContent },
    dispatch
  } = useEditor()
  const step = steps?.find((step) => step.id === id)
  const actionBlocks = filterActionBlocks(step)
  const card = step?.children[0] as TreeBlock<CardBlock> | undefined
  const { title, subtitle, description, priorityBlock, bgImage } =
    getCardMetadata(card)
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const { journey } = useJourney()

  async function handleSourceConnect(
    params: { target: string; source: string } | Parameters<OnConnect>[0]
  ): Promise<void> {
    const targetId = params.target
    const sourceId = params.source
    if (journey == null || targetId == null || sourceId == null) return

    await stepBlockNextBlockUpdate({
      variables: {
        id: sourceId,
        journeyId: journey.id,
        input: {
          nextBlockId: targetId
        }
      }
    })
  }

  function handleClick(): void {
    const space = actionBlocks.length > 0 ? 3 : 0
    console.log('space: ', space)

    dispatch({ type: 'SetSelectedStepAction', selectedStep: step })
  }

  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const isSelected =
    activeContent === ActiveContent.Canvas && selectedStep?.id === step?.id

  const desktopStyle = {
    '.fab': {
      opacity: 0,
      transform: 'scale(0.5)',
      transition: (theme) =>
        theme.transitions.create(['opacity', 'transform'], {
          duration: 250
        })
    },
    '&:hover .fab': {
      transform: 'scale(1)',
      opacity: 1
    },
    position: 'relative'
  }

  const mobileStyle = {
    '.fab': {
      opacity: isSelected ? 1 : 0,
      transform: isSelected ? 'scale(1)' : 'scale(0.5)',
      transition: (theme) =>
        theme.transitions.create(['opacity', 'transform'], {
          duration: 250
        })
    },
    position: 'relative'
  }

  return step != null ? (
    <Box
      sx={{
        gap: 4,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <BaseNode
        id={step.id}
        isTargetConnectable
        isSourceConnectable="arrow"
        selected={isSelected}
        onSourceConnect={handleSourceConnect}
        sourceHandleProps={{
          sx: {
            //  bottom: actionBlocks.length > 0 ? 35 : 0
          }
        }}
      >
        {({ selected }) => (
          <Stack data-testid="spacingStack" alignItems="center">
            <Box
              onTouchStart={() => console.log('touch')}
              sx={{
                ...(isDesktop ? desktopStyle : mobileStyle),
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  top: STEP_NODE_HEIGHT + 3,
                  left: '50%',
                  width: STEP_NODE_WIDTH - 5,
                  height: 18,
                  backgroundColor: 'transparent'
                  // borderRadius: '50%'
                }
              }}
            >
              <StepBlockNodeMenu className="fab" step={step} />
              <Card
                sx={{
                  borderRadius: 2,
                  outline: (theme) =>
                    `2px solid ${
                      selected === true ? theme.palette.primary.main : 'white'
                    }`,
                  width: 190
                }}
                onClick={handleClick}
              >
                <CardContent
                  data-testid="Step block"
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
                        color: '#26262E',
                        wordBreak: 'break-all'
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
            </Box>
          </Stack>
        )}
      </BaseNode>

      <Stack
        data-testid="ActionsStack"
        direction="row"
        spacing={2}
        sx={{
          height: actionBlocks.length > 0 ? 28 : 0
        }}
      >
        {actionBlocks.map((block) => (
          <ActionButton key={block.id} block={block} step={step} />
        ))}
      </Stack>
    </Box>
  ) : (
    <></>
  )
}
