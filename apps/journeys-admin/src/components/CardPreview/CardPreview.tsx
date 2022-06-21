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
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'
import { StepAndCardBlockCreate } from '../../../__generated__/StepAndCardBlockCreate'
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
  mutation StepAndCardBlockCreate(
    $journeyId: ID!
    $stepId: ID!
    $cardId: ID
    $parentOrder: Int
  ) {
    stepBlockCreate(
      input: { id: $stepId, journeyId: $journeyId, parentOrder: $parentOrder }
    ) {
      ...StepFields
    }
    cardBlockCreate(
      input: { id: $cardId, journeyId: $journeyId, parentBlockId: $stepId }
    ) {
      ...CardFields
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
        cardId,
        parentOrder:
          selected?.parentOrder != null ? selected.parentOrder + 1 : null
      },
      update(cache, { data }) {
        if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                // update existing parentOrder in cache
                if (selected?.parentOrder != null) {
                  existingBlockRefs.forEach((blockRef) => {
                    if ((blockRef.__ref as string).startsWith('StepBlock:')) {
                      const stepBlock = cache.readFragment<StepBlock>({
                        id: blockRef.__ref,
                        fragment: gql`
                          fragment StepBlock on StepBlock {
                            parentOrder
                          }
                        `
                      })
                      if (
                        stepBlock?.parentOrder != null &&
                        selected?.parentOrder != null &&
                        stepBlock.parentOrder > selected.parentOrder
                      ) {
                        cache.writeFragment({
                          id: blockRef.__ref,
                          fragment: gql`
                            fragment StepBlock on StepBlock {
                              parentOrder
                            }
                          `,
                          data: {
                            parentOrder: stepBlock.parentOrder + 1
                          }
                        })
                      }
                    }
                  })
                }
                const newStepBlockRef = cache.writeFragment({
                  data: {
                    ...data.stepBlockCreate
                  },
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
  }

  const AddCardSlide = (): ReactElement => (
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
  return (
    <>
      {steps != null ? (
        <HorizontalSelect
          onChange={handleChange}
          id={selected?.id}
          insert={showAddButton === true && <AddCardSlide />}
          insertPosition={steps.findIndex(({ id }) => id === selected?.id)}
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
