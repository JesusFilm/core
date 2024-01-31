import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { StepBlockNextBlockUpdate } from '../../../../../../../../../__generated__/StepBlockNextBlockUpdate'
import { StepFields } from '../../../../../../../../../__generated__/StepFields'
import { CardPreview, OnSelectProps } from '../../../../../../../CardPreview'

export const STEP_BLOCK_NEXT_BLOCK_UPDATE = gql`
  mutation StepBlockNextBlockUpdate(
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

export function Cards(): ReactElement {
  const [stepBlockNextBlockUpdate] = useMutation<StepBlockNextBlockUpdate>(
    STEP_BLOCK_NEXT_BLOCK_UPDATE
  )
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
