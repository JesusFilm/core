import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { ReactElement, FocusEvent } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { Formik, Form } from 'formik'
import { noop } from 'lodash'
import { useTranslation } from 'react-i18next'
import { TextResponseHintUpdate } from '../../../../../../../../../__generated__/TextResponseHintUpdate'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/GetJourney'

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
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleSubmit(e: FocusEvent): Promise<void> {
    if (journey == null || selectedBlock == null) return
    const target = e.target as HTMLInputElement
    await textResponseHintUpdate({
      variables: {
        id: selectedBlock?.id,
        journeyId: journey.id,
        input: {
          hint: target.value
        }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id: selectedBlock?.id,
          __typename: 'TextResponseBlock',
          hint: target.value
        }
      }
    })
  }

  const initialValues =
    selectedBlock != null
      ? {
          textResponseHint: selectedBlock.hint ?? ''
        }
      : null
  const maxCharacters = 22

  return (
    <Box sx={{ px: 6, py: 4 }}>
      {initialValues != null ? (
        <Formik initialValues={initialValues} onSubmit={noop}>
          {({ values, errors, handleChange, handleBlur }) => (
            <Form>
              <TextField
                id="textResponseHint"
                name="textResponseHint"
                variant="filled"
                label="Hint"
                fullWidth
                value={values.textResponseHint}
                inputProps={{ maxLength: maxCharacters }}
                helperText={t('Can only be {{maxCharacters}} characters', {
                  maxCharacters
                })}
                onChange={handleChange}
                onBlur={(e) => {
                  handleBlur(e)
                  errors.textResponseHint == null && handleSubmit(e)
                }}
              />
            </Form>
          )}
        </Formik>
      ) : (
        <TextField
          variant="filled"
          label="Hint"
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
