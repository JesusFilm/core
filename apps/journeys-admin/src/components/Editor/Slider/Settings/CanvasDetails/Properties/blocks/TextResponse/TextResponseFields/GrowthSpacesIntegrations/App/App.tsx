import { gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseIntegrationUpdate,
  TextResponseIntegrationUpdateVariables
} from '../../../../../../../../../../../../__generated__/TextResponseIntegrationUpdate'
import { useIntegrationQuery } from '../../../../../../../../../../../libs/useIntegrationQuery'
import { Select } from '../Select'

export const TEXT_RESPONSE_INTEGRATION_UPDATE = gql`
  mutation TextResponseIntegrationUpdate(
    $id: ID!
    $integrationId: String
    $routeId: String
  ) {
    textResponseBlockUpdate(
      id: $id
      input: { integrationId: $integrationId, routeId: $routeId }
    ) {
      id
      integrationId
      routeId
    }
  }
`

export function App(): ReactElement {
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

  const { data, loading } = useIntegrationQuery({
    teamId: activeTeam?.id as string
  })

  const options =
    data?.integrations
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .filter(({ __typename }) => __typename === 'IntegrationGrowthSpaces')
      .map(({ id, accessId }) => ({ value: id, label: accessId })) ?? []

  function handleChange(integrationId: string | null): void {
    if (selectedBlock == null) return

    add({
      parameters: {
        execute: {
          integrationId,
          routeId: null
        },
        undo: {
          integrationId: selectedBlock.integrationId,
          routeId: selectedBlock.routeId
        }
      },
      execute({ integrationId, routeId }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId
        })
        void textResponseIntegrationUpdate({
          variables: {
            id: selectedBlock.id,
            integrationId,
            routeId
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              __typename: 'TextResponseBlock',
              integrationId,
              routeId
            }
          }
        })
      }
    })
  }

  return !loading && options.length > 0 ? (
    <>
      <Typography variant="subtitle2">{t('Growth Spaces')}</Typography>
      <Select
        label={t('App ID')}
        value={selectedBlock?.integrationId ?? undefined}
        onChange={handleChange}
        options={options}
      />
    </>
  ) : (
    <></>
  )
}
