import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { FocusEvent, ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

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

  async function handleSubmit(e: FocusEvent): Promise<void> {
    if (selectedBlock == null) return
    const target = e.target as HTMLInputElement
    const hint = target.value

    await add({
      parameters: {
        execute: { hint },
        undo: { hint: selectedBlock.hint }
      },
      async execute({ hint }) {
        dispatch({
          type: 'SetCommandStateAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          activeSlide: ActiveSlide.Content,
          activeContent: ActiveContent.Canvas
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

  const initialValues =
    selectedBlock != null
      ? {
          textResponseHint: selectedBlock.hint ?? ''
        }
      : null

  return (
    <Box sx={{ p: 4, pt: 0 }} data-testid="Hint">
      {initialValues != null ? (
        <Formik
          initialValues={initialValues}
          onSubmit={noop}
          enableReinitialize
        >
          {({ values, errors, handleChange, handleBlur }) => (
            <Form>
              <TextField
                id="textResponseHint"
                name="textResponseHint"
                variant="filled"
                label={t('Hint')}
                fullWidth
                value={values.textResponseHint}
                inputProps={{ maxLength: 250 }}
                onChange={handleChange}
                onBlur={(e) => {
                  handleBlur(e)
                  if (errors.textResponseHint == null) void handleSubmit(e)
                }}
              />
            </Form>
          )}
        </Formik>
      ) : (
        <TextField
          variant="filled"
          label={t('Hint')}
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
