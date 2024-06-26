import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { StepBlockLockUpdate } from '../../../../../../../../../../../__generated__/StepBlockLockUpdate'
import { StepFields } from '../../../../../../../../../../../__generated__/StepFields'
import { ToggleOption } from '../../../../controls/ToggleOption'

export const STEP_BLOCK_LOCK_UPDATE = gql`
  mutation StepBlockLockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: StepBlockUpdateInput!
  ) {
    stepBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      locked
    }
  }
`

export function Conditions(): ReactElement {
  const [stepBlockLockUpdate] = useMutation<StepBlockLockUpdate>(
    STEP_BLOCK_LOCK_UPDATE
  )
  const {
    state: { selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const theme = useTheme()
  const block = selectedBlock as TreeBlock<StepFields>

  async function handleChange(): Promise<void> {
    if (journey == null) return

    await stepBlockLockUpdate({
      variables: {
        id: block.id,
        journeyId: journey.id,
        input: {
          locked: !block.locked
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id: block.id,
          __typename: 'StepBlock',
          locked: !block.locked
        }
      }
    })
  }

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box sx={{ p: 4 }} data-testid="Conditions">
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ [theme.breakpoints.down('sm')]: { display: 'none' }, mb: 4 }}
      >
        {t('Conditions')}
      </Typography>
      <ToggleOption
        heading={t('Lock the next step')}
        description={t('Prevent skipping of current card')}
        checked={block.locked}
        handleChange={handleChange}
      >
        <Box display="flex" alignItems="center" color="text.secondary">
          <InformationCircleContainedIcon sx={{ mr: 4 }} />
          <Typography variant="caption">
            {t(
              "User can't skip interaction on the current card, like watching video or interacting with questions."
            )}
          </Typography>
        </Box>
      </ToggleOption>
    </Box>
  )
}
