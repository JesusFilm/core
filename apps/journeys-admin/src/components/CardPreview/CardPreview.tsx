import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import {
  BlockRenderer,
  CARD_FIELDS,
  STEP_FIELDS,
  TreeBlock,
  transformer,
  useJourney
} from '@core/journeys/ui'
import { ThemeProvider } from '@core/shared/ui'
import AddIcon from '@mui/icons-material/Add'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, gql } from '@apollo/client'
import last from 'lodash/last'
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'
import { StepAndCardBlockCreate } from '../../../__generated__/StepAndCardBlockCreate'
import { StepBlockNextBlockIdUpdate } from '../../../__generated__/StepBlockNextBlockIdUpdate'
import { VideoBlockSetDefaultAction } from '../../../__generated__/VideoBlockSetDefaultAction'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_VideoBlock as VideoBlock,
} from '../../../__generated__/BlockFields'
import { FramePortal } from '../FramePortal'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { HorizontalSelect } from '../HorizontalSelect'
import { VideoWrapper } from '../Editor/Canvas/VideoWrapper'
import { CardWrapper } from '../Editor/Canvas/CardWrapper'

export interface CardPreviewProps {
  onSelect?: (step: TreeBlock<StepBlock>) => void
  selected?: TreeBlock<StepBlock>
  steps?: Array<TreeBlock<StepBlock>>
  showAddButton?: boolean
}

export const STEP_AND_CARD_BLOCK_CREATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepAndCardBlockCreate($journeyId: ID!, $stepId: ID!, $cardId: ID) {
    stepBlockCreate(input: { id: $stepId, journeyId: $journeyId }) {
      ...StepFields
    }
    cardBlockCreate(
      input: { id: $cardId, journeyId: $journeyId, parentBlockId: $stepId }
    ) {
      ...CardFields
    }
  }
`

export const STEP_BLOCK_NEXTBLOCKID_UPDATE = gql`
  mutation StepBlockNextBlockIdUpdate(
    $id: ID!
    $journeyId: ID!
    $input: StepBlockUpdateInput!
  ) {
    stepBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      nextBlockId
    }
  }
`

export const VIDEO_BLOCK_SET_DEFAULT_ACTION = gql`
  mutation VideoBlockSetDefaultAction(
    $id: ID!
    $journeyId: ID!
    $input: NavigateToBlockActionInput!
  ) {
    blockUpdateNavigateToBlockAction(
      id: $id
      journeyId: $journeyId
      input: $input
    ) {
      gtmEventName
      blockId
    }
  }
`

export function CardPreview({
  steps,
  selected,
  onSelect,
  showAddButton
}: CardPreviewProps): ReactElement {
  const [stepAndCardBlockCreate] = useMutation<StepAndCardBlockCreate>(
    STEP_AND_CARD_BLOCK_CREATE
  )
  const [stepBlockNextBlockIdUpdate] = useMutation<StepBlockNextBlockIdUpdate>(
    STEP_BLOCK_NEXTBLOCKID_UPDATE
  )
  const [videoBlockSetDefaultAction] = useMutation<VideoBlockSetDefaultAction>(
    VIDEO_BLOCK_SET_DEFAULT_ACTION
  )
  const { journey } = useJourney()

  const handleChange = (selectedId: string): void => {
    if (steps == null) return

    const selectedStep = steps.find(({ id }) => id === selectedId)
    selectedStep != null && onSelect?.(selectedStep)
  }

  const handleClick = async (): Promise<void> => {
    if (journey == null || steps == null) return

    const stepId = uuidv4()
    const cardId = uuidv4()
    const { data } = await stepAndCardBlockCreate({
      variables: {
        journeyId: journey.id,
        stepId,
        cardId
      },
      update(cache, { data }) {
        if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const newStepBlockRef = cache.writeFragment({
                  data: data.stepBlockCreate,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                const newCardBlockRef = cache.writeFragment({
                  data: data.cardBlockCreate,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, newStepBlockRef, newCardBlockRef]
              }
            }
          })
        }
      }
    })
    if (data?.stepBlockCreate != null) {
      onSelect?.(
        transformer([
          data.stepBlockCreate,
          data.cardBlockCreate
        ])[0] as TreeBlock<StepBlock>
      )
    }

    const prevStep = last(steps)
    // this check is required as nextBlockId is not updated when the corrseponding block is deleted
    const validNextBlockId =
      steps.find(({ id }) => id === prevStep?.nextBlockId) != null
    if (!validNextBlockId && prevStep != null) {
      await stepBlockNextBlockIdUpdate({
        variables: {
          id: prevStep.id,
          journeyId: journey.id,
          input: {
            nextBlockId: stepId
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            __typename: 'StepBlock',
            id: prevStep.id,
            nextBlockId: stepId
          }
        }
      })
    }

    // this sets video block default action to navigate to the newly created step
    const prevCard = prevStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as unknown as TreeBlock<CardBlock>
    const videoBlock = prevCard?.children.find(
      (block) => block.__typename === 'VideoBlock'
    ) as unknown as TreeBlock<VideoBlock>
    // const validVideoNextBlockId =
    //   videoBlock?.action != null ||
    //   (videoBlock?.action?.__typename === 'NavigateToBlockAction' &&
    //     steps?.find(({ id }) => id === videoBlock?.action?.blockId) != null)

    if (
      // validVideoNextBlockId &&
      prevCard != null &&
      videoBlock != null &&
      prevCard.coverBlockId !== videoBlock.id
    ) {
      await videoBlockSetDefaultAction({
        variables: {
          id: videoBlock.id,
          journeyId: journey.id,
          input: {
            blockId: stepId
          }
        },
        update(cache, { data }) {
          if (data?.blockUpdateNavigateToBlockAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: 'VideoBlock',
                id: videoBlock.id
              }),
              fields: {
                action: () => data?.blockUpdateNavigateToBlockAction
              }
            })
          }
        }
      })
    }
  }

  return (
    <>
      {steps != null ? (
        <HorizontalSelect
          onChange={handleChange}
          id={selected?.id}
          footer={
            showAddButton === true && (
              <Card
                id="CardPreviewAddButton"
                variant="outlined"
                sx={{
                  display: 'flex',
                  width: 87,
                  height: 132,
                  m: 1
                }}
              >
                <CardActionArea
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onClick={handleClick}
                >
                  <AddIcon color="primary" />
                </CardActionArea>
              </Card>
            )
          }
        >
          {steps.map((step) => (
            <Box
              id={step.id}
              key={step.id}
              data-testid={`preview-${step.id}`}
              sx={{
                width: 95,
                height: 140
              }}
            >
              <Box
                sx={{
                  transform: 'scale(0.25)',
                  transformOrigin: 'top left'
                }}
              >
                <FramePortal width={380} height={560}>
                  <ThemeProvider
                    themeName={journey?.themeName ?? ThemeName.base}
                    themeMode={journey?.themeMode ?? ThemeMode.light}
                  >
                    <Box sx={{ p: 4, height: '100%' }}>
                      <BlockRenderer
                        block={step}
                        wrappers={{
                          VideoWrapper,
                          CardWrapper
                        }}
                      />
                    </Box>
                  </ThemeProvider>
                </FramePortal>
              </Box>
            </Box>
          ))}
        </HorizontalSelect>
      ) : (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
            py: 5,
            px: 6
          }}
        >
          <Box
            sx={{
              border: '3px solid transparent'
            }}
          >
            <Skeleton
              variant="rectangular"
              width={87}
              height={132}
              sx={{ m: 1, borderRadius: 1 }}
            />
          </Box>
          <Box
            sx={{
              border: '3px solid transparent'
            }}
          >
            <Skeleton
              variant="rectangular"
              width={87}
              height={132}
              sx={{ m: 1, borderRadius: 1 }}
            />
          </Box>
          <Box
            sx={{
              border: '3px solid transparent'
            }}
          >
            <Skeleton
              variant="rectangular"
              width={87}
              height={132}
              sx={{ m: 1, borderRadius: 1 }}
            />
          </Box>
        </Stack>
      )}
    </>
  )
}
