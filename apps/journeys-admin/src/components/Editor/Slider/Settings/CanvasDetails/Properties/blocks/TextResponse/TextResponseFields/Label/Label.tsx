import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { FocusEvent, ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseLabelUpdate } from '../../../../../../../../../../../__generated__/TextResponseLabelUpdate'

export const TEXT_RESPONSE_LABEL_UPDATE = gql`
  mutation TextResponseLabelUpdate(
    $id: ID!
    $journeyId: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      label
    }
  }
`

export function Label(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseLabelUpdate] = useMutation<TextResponseLabelUpdate>(
    TEXT_RESPONSE_LABEL_UPDATE
  )
  const { journey } = useJourney()
  const { state, dispatch } = useEditor()
  const { add } = useCommand()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleSubmit(e: FocusEvent): Promise<void> {
    const target = e.target as HTMLInputElement
    const label = target.value
    if (selectedBlock != null && journey != null) {
      await add({
        parameters: {
          execute: { id: selectedBlock.id, journeyId: journey.id, label },
          undo: {
            id: selectedBlock.id,
            journeyId: journey.id,
            label: selectedBlock.label
          }
        },
        async execute({ id, journeyId, label }) {
          dispatch({
            type: 'SetSelectedStepAction',
            selectedStep: state.selectedStep
          })

          dispatch({
            type: 'SetSelectedBlockAction',
            selectedBlock: selectedBlock
          })

          await textResponseLabelUpdate({
            variables: {
              id,
              journeyId,
              input: {
                label
              }
            },
            optimisticResponse: {
              textResponseBlockUpdate: {
                id,
                label,
                __typename: 'TextResponseBlock'
              }
            }
          })
        },
        async undo({ id, journeyId, label }) {
          await textResponseLabelUpdate({
            variables: {
              id,
              journeyId,
              input: {
                label
              }
            },
            optimisticResponse: {
              textResponseBlockUpdate: {
                id,
                label,
                __typename: 'TextResponseBlock'
              }
            }
          })
          dispatch({
            type: 'SetSelectedStepAction',
            selectedStep: state.selectedStep
          })
          dispatch({
            type: 'SetSelectedBlockAction',
            selectedBlock: selectedBlock
          })
        }
      })
    }
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
