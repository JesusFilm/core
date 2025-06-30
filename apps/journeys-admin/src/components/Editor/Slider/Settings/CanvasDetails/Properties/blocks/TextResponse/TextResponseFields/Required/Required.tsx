import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseRequiredUpdate,
  TextResponseRequiredUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseRequiredUpdate'
import { ToggleOption } from '../../../../controls/ToggleOption'

export const TEXT_RESPONSE_REQUIRED_UPDATE = gql`
  mutation TextResponseRequiredUpdate($id: ID!, $required: Boolean) {
    textResponseBlockUpdate(id: $id, input: { required: $required }) {
      id
      required
    }
  }
`

export function Required(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseRequiredUpdate] = useMutation<
    TextResponseRequiredUpdate,
    TextResponseRequiredUpdateVariables
  >(TEXT_RESPONSE_REQUIRED_UPDATE)
  const { state } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleChange(): Promise<void> {
    if (selectedBlock == null) return
    const required = !selectedBlock.required

    add({
      parameters: {
        execute: { required },
        undo: {
          required: selectedBlock.required
        }
      },
      execute({ required }) {
        void textResponseRequiredUpdate({
          variables: {
            id: selectedBlock.id,
            required
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              required,
              __typename: 'TextResponseBlock'
            }
          }
        })
      }
    })
  }

  return (
    <Box sx={{ px: 4 }} data-testid="Required">
      <ToggleOption
        heading={t('Required')}
        checked={selectedBlock?.required ?? false}
        handleChange={handleChange}
      />
    </Box>
  )
}
