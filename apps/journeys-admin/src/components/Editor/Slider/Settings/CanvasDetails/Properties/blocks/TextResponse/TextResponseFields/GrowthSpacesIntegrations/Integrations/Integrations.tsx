import { gql, useMutation } from '@apollo/client'
import { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseIntegrationUpdate } from '../../../../../../../../../../../../__generated__/TextResponseIntegrationUpdate'
import { useIntegrationQuery } from '../../../../../../../../../../../libs/useIntegrationQuery'
import { Select } from '../Select'

export const TEXT_RESPONSE_INTEGRATION_UPDATE = gql`
  mutation TextResponseIntegrationUpdate(
    $id: ID!, 
    $journeyId: ID!, 
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      integrationId
    }
  }
`

export function Integrations(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  const [textResponseIntegrationUpdate] =
    useMutation<TextResponseIntegrationUpdate>(TEXT_RESPONSE_INTEGRATION_UPDATE)

  const { data } = useIntegrationQuery({
    teamId: activeTeam?.id as string
  })

  const selectedIntegration = data?.integrations.find(
    (integration) => selectedBlock?.integrationId === integration.id
  )
  const value = selectedIntegration?.type.concat(
    ` - ${selectedIntegration?.accessSecretPart}`
  )
  const options = data?.integrations.map((integration) =>
    integration.type.concat(` - ${integration.accessSecretPart}`)
  )

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    if (journey == null || selectedBlock == null) return
    const accessSecretPart = event.target.value.split(' - ')[1]
    const integrationId = data?.integrations.find(
      (integration) => integration.accessSecretPart === accessSecretPart
    )?.id

    if (integrationId == null) return

    await textResponseIntegrationUpdate({
      variables: {
        id: selectedBlock.id,
        journeyId: journey.id,
        input: {
          integrationId
        }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          integrationId
        }
      }
    })
  }

  return (
    <>
      <Typography variant="subtitle2">
        {t('Growth Spaces Integrations')}
      </Typography>
      <Select
        label="Integrations"
        value={value ?? ''}
        onChange={handleChange}
        options={options}
      />
    </>
  )
}
