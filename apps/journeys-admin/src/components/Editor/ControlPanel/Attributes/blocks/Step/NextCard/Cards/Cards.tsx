import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { StepFields } from '../../../../../../../../../__generated__/StepFields'
import { CardPreview, OnSelectProps } from '../../../../../../../CardPreview'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../../../libs/useStepBlockNextBlockUpdateMutation'

export function Cards(): ReactElement {
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const {
    state: { steps, selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const theme = useTheme()
  const { id, nextBlockId, parentOrder } =
    selectedBlock as TreeBlock<StepFields>

  let nextStep: TreeBlock<StepFields> | undefined

  if (nextBlockId == null && steps != null && parentOrder != null) {
    nextStep = steps[parentOrder + 1]
  } else {
    nextStep = steps?.find(({ id }) => nextBlockId === id)
  }

  async function handleSelectStep({ step }: OnSelectProps): Promise<void> {
    if (journey == null || step == null) return
    await stepBlockNextBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: {
          nextBlockId: step.id
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id,
          __typename: 'StepBlock',
          nextBlockId: step.id
        }
      }
    })
  }

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Box sx={{ pl: 6, pr: 4, pt: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{ [theme.breakpoints.down('sm')]: { display: 'none' } }}
        >
          {t('Cards')}
        </Typography>
      </Box>
      <CardPreview
        selected={nextStep}
        steps={steps}
        onSelect={handleSelectStep}
        testId="Cards"
      />
    </>
  )
}
