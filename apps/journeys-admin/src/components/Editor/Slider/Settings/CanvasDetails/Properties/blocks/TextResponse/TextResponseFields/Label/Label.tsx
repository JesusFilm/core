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
  TextResponseLabelUpdate,
  TextResponseLabelUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseLabelUpdate'

export const TEXT_RESPONSE_LABEL_UPDATE = gql`
  mutation TextResponseLabelUpdate(
    $id: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, input: $input) {
      id
      label
    }
  }
`

interface Values {
  label: string
}

export function Label(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseLabelUpdate] = useMutation<
    TextResponseLabelUpdate,
    TextResponseLabelUpdateVariables
  >(TEXT_RESPONSE_LABEL_UPDATE)
  const { state, dispatch } = useEditor()
  const { add } = useCommand()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleSubmit({ label }: Values): Promise<void> {
    if (selectedBlock == null || selectedBlock.label === label) return

    await add({
      parameters: {
        execute: { label },
        undo: { label: selectedBlock.label }
      },
      async execute({ label }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep
        })

        await textResponseLabelUpdate({
          variables: {
            id: selectedBlock.id,
            input: {
              label
            }
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              label,
              __typename: 'TextResponseBlock'
            }
          }
        })
      }
    })
  }

  const initialValues: Values = {
    label: selectedBlock?.label ?? 'Your answer here'
  }

  return (
    <Box sx={{ p: 4, pt: 0 }} data-testid="Label">
      {selectedBlock != null ? (
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, handleChange, handleBlur }) => (
            <Form>
              <TextField
                id="label"
                name="label"
                variant="filled"
                label={t('Label')}
                fullWidth
                value={values.label}
                placeholder={t('Your answer here')}
                inputProps={{ maxLength: 250 }}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <SubmitListener />
            </Form>
          )}
        </Formik>
      ) : (
        <TextField
          variant="filled"
          label={t('Label')}
          fullWidth
          disabled
          sx={{
            pb: 4
          }}
        />
      )}
    </Box>
  )
}
