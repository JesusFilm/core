import { ReactElement } from 'react'

import { gql, useMutation } from '@apollo/client'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseIntegrationUpdate,
  TextResponseIntegrationUpdateVariables
} from '../../../../../../../../../../../../__generated__/TextResponseIntegrationUpdate'
import { useIntegrationQuery } from '../../../../../../../../../../../libs/useIntegrationQuery'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { SelectChangeEvent } from '@mui/material/Select'
import { Select } from '../Select'

export const TEXT_RESPONSE_INTEGRATION_UPDATE = gql`
  mutation TextResponseIntegrationUpdate(
    $id: ID!, 
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, input: $input) {
      id
      integrationId
    }
  }
`

export function Integrations(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { state, dispatch } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  const { add } = useCommand()

  const [textResponseIntegrationUpdate] = useMutation<
    TextResponseIntegrationUpdate,
    TextResponseIntegrationUpdateVariables
  >(TEXT_RESPONSE_INTEGRATION_UPDATE)

  const { data } = useIntegrationQuery({
    teamId: activeTeam?.id as string
  })

  const selectedIntegration = data?.integrations.find(
    (integration) => selectedBlock?.integrationId === integration.id
  )
  const value = selectedIntegration?.type.concat(
    ` - ${selectedIntegration?.accessSecretPart}`
  )
  const options =
    data?.integrations.map((integration) =>
      integration.type.concat(` - ${integration.accessSecretPart}`)
    ) ?? []

  async function handleChange(event: SelectChangeEvent) {
    if (selectedBlock == null) return
    const accessSecretPart = event.target.value.split(' - ')[1]
    const integrationId = data?.integrations.find(
      (integration) => integration.accessSecretPart === accessSecretPart
    )?.id

    if (integrationId == null) return

    await add({
      parameters: {
        execute: { integrationId },
        undo: { integrationId: selectedBlock.integrationId }
      },
      async execute({ integrationId }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId
        })
        await textResponseIntegrationUpdate({
          variables: {
            id: selectedBlock.id,
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
    })
  }

  return options?.length > 0 ? (
    <>
      <Typography variant="subtitle2">{t('Growth Spaces')}</Typography>
      <Select
        label={t('Select Integration')}
        value={value ?? ''}
        onChange={handleChange}
        options={options}
      />
    </>
  ) : null
}
