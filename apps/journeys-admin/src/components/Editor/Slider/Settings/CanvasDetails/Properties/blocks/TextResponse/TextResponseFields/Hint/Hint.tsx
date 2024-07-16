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

import {
  BlockFields_StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseHintUpdate } from '../../../../../../../../../../../__generated__/TextResponseHintUpdate'

export const TEXT_RESPONSE_HINT_UPDATE = gql`
  mutation TextResponseHintUpdate(
    $id: ID!
    $journeyId: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      hint
    }
  }
`

export function Hint(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseHintUpdate] = useMutation<TextResponseHintUpdate>(
    TEXT_RESPONSE_HINT_UPDATE
  )
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

  async function handleSubmit(e: FocusEvent): Promise<void> {
    if (selectedBlock != null && journey != null) {
      const target = e.target as HTMLInputElement
      const hint = target.value

      await add({
        parameters: {
          execute: { id: selectedBlock.id, journeyId: journey.id, hint },
          undo: {
            id: selectedBlock.id,
            journeyId: journey.id,
            hint: selectedBlock.hint
          }
        },
        async execute({ id, journeyId, hint }) {
          updateEditorState(state.selectedStep, selectedBlock)

          await textResponseHintUpdate({
            variables: {
              id,
              journeyId,
              input: {
                hint
              }
            },
            optimisticResponse: {
              textResponseBlockUpdate: {
                id,
                hint,
                __typename: 'TextResponseBlock'
              }
            }
          })
        },
        async undo({ id, journeyId, hint }) {
          await textResponseHintUpdate({
            variables: {
              id,
              journeyId,
              input: {
                hint
              }
            },
            optimisticResponse: {
              textResponseBlockUpdate: {
                id,
                hint,
                __typename: 'TextResponseBlock'
              }
            }
          })
          updateEditorState(state.selectedStep, selectedBlock)
        }
      })
    }
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
