import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import last from 'lodash/last'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import Lock1Icon from '@core/shared/ui/icons/Lock1'
import MinusCircleContained from '@core/shared/ui/icons/MinusCircleContained'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../__generated__/globalTypes'
import { StepBlockNextBlockUpdate } from '../../../../../../../../../__generated__/StepBlockNextBlockUpdate'
import { StepFields } from '../../../../../../../../../__generated__/StepFields'
import { FramePortal } from '../../../../../../../FramePortal'
import { CardWrapper } from '../../../../../../Canvas/CardWrapper'
import { VideoWrapper } from '../../../../../../Canvas/VideoWrapper'

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

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ px: 4, pb: 4 }}
      data-testid={`SelectedCard-${id}`}
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
          <Typography variant="subtitle2">{t('Selected Step')}</Typography>
          {locked && (
            <Stack direction="row" spacing={1}>
              <Lock1Icon sx={{ fontSize: '18px', color: 'secondary.light' }} />
              <Typography variant="caption" sx={{ color: 'secondary.light' }}>
                {t('Locked With Interaction')}
              </Typography>
            </Stack>
          )}
          {nextBlockId == null && lastStep !== selectedBlock && (
            <Typography variant="caption" sx={{ color: 'secondary.light' }}>
              {t('Default next step in journey')}
            </Typography>
          )}
          {lastStep === selectedBlock && (
            <Typography variant="caption" sx={{ color: 'secondary.light' }}>
              {t('No next step in journey')}
            </Typography>
          )}
        </Stack>
      </Stack>
      {nextBlockId != null && nextStep?.id !== id && (
        <IconButton
          onClick={handleRemoveCustomNextStep}
          data-testid="removeCustomNextStep"
        >
          <MinusCircleContained color="primary" />
        </IconButton>
      )}
    </Stack>
  )
}
