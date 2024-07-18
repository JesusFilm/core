import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { FocusEvent, ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

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

  async function handleSubmit(e: FocusEvent): Promise<void> {
    if (selectedBlock == null) return
    const target = e.target as HTMLInputElement
    const label = target.value
    await add({
      parameters: {
        execute: { label },
        undo: { label: selectedBlock.label }
      },
      async execute({ label }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId,
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.Content,
          activeContent: ActiveContent.Canvas
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

  const initialValues =
    selectedBlock != null ? { textResponseLabel: selectedBlock.label } : null

  return (
    <Box sx={{ p: 4, pt: 0 }} data-testid="Label">
      {selectedBlock != null ? (
        <Formik
          initialValues={initialValues}
          onSubmit={noop}
          enableReinitialize
        >
          {({ values, errors, handleChange, handleBlur, setValues }) => (
            <Form>
              <TextField
                id="textResponseLabel"
                name="textResponseLabel"
                variant="filled"
                label={t('Label')}
                fullWidth
                value={values.textResponseLabel}
                placeholder={t('Your answer here')}
                inputProps={{ maxLength: 250 }}
                onChange={handleChange}
                onBlur={async (e) => {
                  handleBlur(e)
                  if (values.textResponseLabel.trim() === '') {
                    e.target.value = t('Your answer here')
                    await setValues({
                      textResponseLabel: t('Your answer here')
                    })
                  }
                  if (errors.textResponseLabel == null) void handleSubmit(e)
                }}
              />
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
