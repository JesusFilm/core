import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseMinRowsUpdate,
  TextResponseMinRowsUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseMinRowsUpdate'
import { ToggleButtonGroup } from '../../../../controls/ToggleButtonGroup'

export const TEXT_RESPONSE_MIN_ROWS_UPDATE = gql`
  mutation TextResponseMinRowsUpdate(
    $id: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id,input: $input) {
      id
      minRows
    }
  }
`

export function MinRows(): ReactElement {
  const [textResponseMinRowsUpdate] = useMutation<
    TextResponseMinRowsUpdate,
    TextResponseMinRowsUpdateVariables
  >(TEXT_RESPONSE_MIN_ROWS_UPDATE)

  const { t } = useTranslation('apps-journeys-admin')
  const { state, dispatch } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleChange(minRows: number): Promise<void> {
    if (selectedBlock == null) return
    await add({
      parameters: {
        execute: { minRows },
        undo: {
          minRows: selectedBlock.minRows
        }
      },
      async execute({ minRows }) {
        dispatch({
          type: 'SetSelectedStepAction',
          selectedStep: state.selectedStep
        })

        dispatch({
          type: 'SetSelectedBlockAction',
          selectedBlock
        })

        await textResponseMinRowsUpdate({
          variables: {
            id: selectedBlock.id,
            input: {
              minRows
            }
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              minRows,
              __typename: 'TextResponseBlock'
            }
          }
        })
      }
    })
  }

  const options = [
    {
      value: 1,
      label: t('One Row')
    },
    {
      value: 2,
      label: t('Two Rows')
    },
    {
      value: 3,
      label: t('Three Rows')
    },
    {
      value: 4,
      label: t('Four Rows')
    }
  ]

  return (
    <ToggleButtonGroup
      label={t('Minimum Size')}
      value={selectedBlock?.minRows ?? 3}
      onChange={handleChange}
      options={options}
      testId="MinRows"
    />
  )
}
