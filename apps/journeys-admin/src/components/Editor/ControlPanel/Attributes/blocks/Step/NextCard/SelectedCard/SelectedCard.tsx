import { ReactElement, useState, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import last from 'lodash/last'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { StepFields } from '../../../../../../../../../__generated__/StepFields'
import { StepBlockNextBlockUpdate } from '../../../../../../../../../__generated__/StepBlockNextBlockUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../__generated__/globalTypes'
import { VideoWrapper } from '../../../../../../Canvas/VideoWrapper'
import { CardWrapper } from '../../../../../../Canvas/CardWrapper'

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
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const { id, nextBlockId, locked, parentOrder } =
    selectedBlock as TreeBlock<StepFields>
  const [nextStep, setNextStep] = useState(
    steps?.find((step) => nextBlockId === step.id)
  )
  const lastStep = last(steps)

  useEffect(() => {
    if (
      nextBlockId == null &&
      steps != null &&
      parentOrder != null &&
      lastStep !== selectedBlock
    ) {
      setNextStep(steps[parentOrder + 1])
    } else {
      setNextStep(steps?.find((step) => nextBlockId === step.id))
    }
  }, [steps, nextBlockId, selectedBlock, lastStep, parentOrder])

  async function handleRemoveCustomNextStep(): Promise<void> {
    if (journey == null) return

    await stepBlockDefaultNextBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: {
          nextBlockId: null
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id,
          __typename: 'StepBlock',
          nextBlockId: null
        }
      }
    })
  }

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
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
            <FramePortal width={380} height={560} dir={rtl ? 'rtl' : 'ltr'}>
              <ThemeProvider
                themeName={journey?.themeName ?? ThemeName.base}
                themeMode={journey?.themeMode ?? ThemeMode.light}
              >
                <Box sx={{ p: 4, height: '100%' }}>
                  <BlockRenderer
                    block={
                      nextStep != null
                        ? nextStep
                        : (selectedBlock as TreeBlock<StepFields>)
                    }
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
          {nextBlockId == null && lastStep !== selectedBlock && (
            <Typography variant="caption" sx={{ color: 'secondary.light' }}>
              Default next step in journey
            </Typography>
          )}
          {lastStep === selectedBlock && (
            <Typography variant="caption" sx={{ color: 'secondary.light' }}>
              No next step in journey
            </Typography>
          )}
        </Stack>
      </Stack>
      {nextBlockId != null && nextStep?.id !== id && (
        <IconButton
          onClick={handleRemoveCustomNextStep}
          data-testid="removeCustomNextStep"
        >
          <RemoveCircleOutlineRoundedIcon color="primary" />
        </IconButton>
      )}
    </Stack>
  )
}
