import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import {
  BlockRenderer,
  CARD_FIELDS,
  STEP_FIELDS,
  TreeBlock,
  transformer
} from '@core/journeys/ui'
import { ThemeProvider } from '@core/shared/ui'
import AddIcon from '@mui/icons-material/Add'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, gql } from '@apollo/client'
import last from 'lodash/last'
import { StepAndCardBlockCreate } from '../../../__generated__/StepAndCardBlockCreate'
import { StepBlockNextBlockIdUpdate } from '../../../__generated__/StepBlockNextBlockIdUpdate'
import { FramePortal } from '../FramePortal'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { HorizontalSelect } from '../HorizontalSelect'
import { useJourney } from '../../libs/context'
import { VideoWrapper } from '../Editor/Canvas/VideoWrapper'
import { CardWrapper } from '../Editor/Canvas/CardWrapper'

export interface CardPreviewProps {
  onSelect?: (step: TreeBlock<StepBlock>) => void
  selected?: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
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
  const { id: journeyId, themeMode, themeName } = useJourney()

  const handleChange = (selectedId: string): void => {
    const selectedStep = steps.find(({ id }) => id === selectedId)
    selectedStep != null && onSelect?.(selectedStep)
  }

  const handleClick = async (): Promise<void> => {
    const stepId = uuidv4()
    const cardId = uuidv4()
    const { data } = await stepAndCardBlockCreate({
      variables: {
        journeyId,
        stepId,
        cardId
      },
      update(cache, { data }) {
        if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journeyId }),
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

    const lastStep = last(steps)
    // this check is required as nextBlockId is not updated when the corrseponding block is deleted
    const validNextBlockId =
      steps.find(({ id }) => id === lastStep?.nextBlockId) != null
    if (!validNextBlockId && lastStep != null) {
      await stepBlockNextBlockIdUpdate({
        variables: {
          id: lastStep.id,
          journeyId,
          input: {
            nextBlockId: stepId
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            __typename: 'StepBlock',
            id: lastStep.id,
            nextBlockId: stepId
          }
        }
      })
    }
  }

  return (
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
              <ThemeProvider themeName={themeName} themeMode={themeMode}>
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
  )
}
