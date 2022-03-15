import { ReactElement, useState, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import { ThemeProvider } from '@core/shared/ui'
import { useEditor, TreeBlock, BlockRenderer } from '@core/journeys/ui'
import { useJourney } from '../../../../../../../../libs/context'
import { StepFields } from '../../../../../../../../../__generated__/StepFields'
import { StepBlockNextBlockUpdate } from '../../../../../../../../../__generated__/StepBlockNextBlockUpdate'
import { FramePortal } from '../../../../../../../FramePortal'

export const STEP_BLOCK_DEFAULT_NEXT_BLOCK_UPDATE = gql`
  mutation StepBlockDefaultNextBlockUpdate(
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

export function SelectedCard(): ReactElement {
  const [stepBlockDefaultNextBlockUpdate] =
    useMutation<StepBlockNextBlockUpdate>(STEP_BLOCK_DEFAULT_NEXT_BLOCK_UPDATE)
  const {
    state: { steps, selectedBlock }
  } = useEditor()
  const journey = useJourney()
  const { id, nextBlockId, locked } = selectedBlock as TreeBlock<StepFields>
  const [nextStep, setNextStep] = useState(
    steps.find((step) => nextBlockId === step.id)
  )

  useEffect(() => {
    setNextStep(steps.find((step) => nextBlockId === step.id))
  }, [steps, nextBlockId])

  // TODO: Set as block itself for now, still need to manually set next block
  async function handleRemoveCustomNextStep(): Promise<void> {
    await stepBlockDefaultNextBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: {
          nextBlockId: id
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id,
          __typename: 'StepBlock',
          nextBlockId: id
        }
      }
    })
  }

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems={'center'}
      sx={{ p: 4, pl: 6 }}
    >
      <Stack direction="row" spacing={4}>
        <Box
          id={id}
          key={id}
          data-testid={`next-step-${id}`}
          sx={{
            width: 58,
            height: 90
          }}
        >
          <Box
            sx={{
              transform: 'scale(0.16)',
              transformOrigin: 'top left'
            }}
          >
            <FramePortal width={380} height={560}>
              <ThemeProvider
                themeName={journey.themeName}
                themeMode={journey.themeMode}
              >
                <Box sx={{ p: 4, height: '100%' }}>
                  <BlockRenderer
                    block={
                      nextStep != null
                        ? nextStep
                        : (selectedBlock as TreeBlock<StepFields>)
                    }
                  />
                </Box>
              </ThemeProvider>
            </FramePortal>
          </Box>
        </Box>
        <Stack direction="column" justifyContent="center">
          <Typography variant="subtitle2">Selected Step</Typography>
          {locked && (
            <Stack direction="row" spacing={1}>
              <LockRoundedIcon
                sx={{ fontSize: '18px', color: 'secondary.light' }}
              />
              <Typography variant="caption" sx={{ color: 'secondary.light' }}>
                Locked With Interaction
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
      {nextStep != null && nextStep.id !== id && (
        <IconButton
          onClick={handleRemoveCustomNextStep}
          data-testId="removeCustomNextStep"
        >
          <RemoveCircleOutlineRoundedIcon color="primary" />
        </IconButton>
      )}
    </Stack>
  )
}
