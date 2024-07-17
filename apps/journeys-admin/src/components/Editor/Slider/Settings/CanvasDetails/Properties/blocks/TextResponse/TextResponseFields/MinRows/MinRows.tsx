import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
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
  const { journey } = useJourney()
  const { state, dispatch } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  function updateEditorState(
    step: TreeBlock<BlockFields_StepBlock> | undefined,
    block: TreeBlock
  ): void {
    dispatch({
      type: 'SetSelectedStepAction',
      selectedStep: step
    })

    dispatch({
      type: 'SetSelectedBlockAction',
      selectedBlock: block
    })
  }

  async function handleChange(minRows: number): Promise<void> {
    if (selectedBlock != null && journey != null) {
      await add({
        parameters: {
          execute: { id: selectedBlock.id, journeyId: journey.id, minRows },
          undo: {
            id: selectedBlock.id,
            journeyId: journey.id,
            minRows: selectedBlock.minRows
          }
        },
        async execute({ id, journeyId, minRows }) {
          updateEditorState(state.selectedStep, selectedBlock)

          await textResponseMinRowsUpdate({
            variables: {
              id,
              journeyId,
              input: {
                minRows
              }
            },
            optimisticResponse: {
              textResponseBlockUpdate: {
                id,
                minRows,
                __typename: 'TextResponseBlock'
              }
            }
          })
        },
        async undo({ id, journeyId, minRows }) {
          await textResponseMinRowsUpdate({
            variables: {
              id,
              journeyId,
              input: {
                minRows
              }
            },
            optimisticResponse: {
              textResponseBlockUpdate: {
                id,
                minRows,
                __typename: 'TextResponseBlock'
              }
            }
          })

          updateEditorState(state.selectedStep, selectedBlock)
        }
      })
    }
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
