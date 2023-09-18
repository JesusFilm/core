import { gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { BlockFields } from '@core/journeys/ui/block/__generated__/BlockFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'

import { StepAndCardBlockCreate } from '../../../../../../__generated__/StepAndCardBlockCreate'
import cardLayoutExpanded from '../../../../../../public/card-layout-expanded.svg'

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

interface BlankCardProps {
  onClick?: (blocks: BlockFields[]) => void
}

export function BlankCard({ onClick }: BlankCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const [stepAndCardBlockCreate] = useMutation<StepAndCardBlockCreate>(
    STEP_AND_CARD_BLOCK_CREATE
  )

  const handleClick = async (): Promise<void> => {
    if (journey == null) return

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
    if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
      onClick?.([data.stepBlockCreate, data.cardBlockCreate])
    }
  }

  return (
    <Stack
      spacing={5}
      onClick={handleClick}
      direction="row"
      alignItems="center"
      sx={{ p: 5, cursor: 'pointer' }}
    >
      <Image
        src={cardLayoutExpanded}
        alt="Expanded"
        width={89}
        height={137}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      <Stack>
        <Typography variant="h5">{t('Blank Card')}</Typography>
        <Typography>{t('An empty card you can use to do stuff.')}</Typography>
      </Stack>
    </Stack>
  )
}
