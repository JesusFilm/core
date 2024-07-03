import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

import { gql, useMutation } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui/block'
import { SelectChangeEvent } from '@mui/material/Select'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseRouteUpdate } from '../../../../../../../../../../../../__generated__/TextResponseRouteUpdate'
import { useIntegrationQuery } from '../../../../../../../../../../../libs/useIntegrationQuery'

import { Select } from '../Select'

export const TEXT_RESPONSE_ROUTE_UPDATE = gql`
  mutation TextResponseRouteUpdate(
    $id: ID!, 
    $journeyId: ID!, 
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      routeId
    }
  }
`

export function Route(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  const [textResponseRouteUpdate] = useMutation<TextResponseRouteUpdate>(
    TEXT_RESPONSE_ROUTE_UPDATE
  )

  const { data } = useIntegrationQuery({
    teamId: activeTeam?.id as string
  })

  const selectedIntegration = data?.integrations.find(
    (integration) => selectedBlock?.integrationId === integration.id
  )

  const value = selectedIntegration?.routes.find(
    (route) => route.id === selectedBlock?.routeId
  )?.name

  const options = selectedIntegration?.routes.map((route) => route.name)

  async function handleChange(event: SelectChangeEvent) {
    if (journey == null || selectedBlock == null) return
    const route = selectedIntegration?.routes.find(
      (route) => route.name === event.target.value
    )

    if (route == null) return

    await textResponseRouteUpdate({
      variables: {
        id: selectedBlock.id,
        journeyId: journey.id,
        input: {
          routeId: route.id
        }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          routeId: route.id
        }
      }
    })
  }

  return (
    <>
      {selectedBlock?.integrationId && (
        <>
          <Typography variant="subtitle2">{t('Route')}</Typography>
          <Select
            label="Routes"
            value={value ?? ''}
            onChange={handleChange}
            options={options}
          />
        </>
      )}
    </>
  )
}
