import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { SubmitListener } from '@core/shared/ui/SubmitListener'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseHintUpdate,
  TextResponseHintUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseHintUpdate'

export const TEXT_RESPONSE_HINT_UPDATE = gql`
  mutation TextResponseHintUpdate(
    $id: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, input: $input) {
      id
      hint
    }
  }
`
interface Values {
  hint: string
}

export function Hint(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseHintUpdate] = useMutation<
    TextResponseHintUpdate,
    TextResponseHintUpdateVariables
  >(TEXT_RESPONSE_HINT_UPDATE)
  const { state, dispatch } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleSubmit({ hint }: Values): Promise<void> {
    if (selectedBlock == null || selectedBlock.hint === hint) return
    await add({
      parameters: {
        execute: { hint },
        undo: { hint: selectedBlock.hint }
      },
      async execute({ hint }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId
        })

        await textResponseHintUpdate({
          variables: {
            id: selectedBlock.id,
            input: {
              hint
            }
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              hint,
              __typename: 'TextResponseBlock'
            }
          }
        })
      }
    })
  }

  const initialValues: Values = { hint: selectedBlock?.hint ?? '' }

  return (
    <Box sx={{ p: 4, pt: 0 }} data-testid="Hint">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, handleBlur }) => (
          <Form>
            <TextField
              id="hint"
              name="hint"
              variant="filled"
              label={t('Hint')}
              fullWidth
              value={values.hint}
              inputProps={{ maxLength: 250 }}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <SubmitListener />
          </Form>
        )}
      </Formik>
    </Box>
  )
}
