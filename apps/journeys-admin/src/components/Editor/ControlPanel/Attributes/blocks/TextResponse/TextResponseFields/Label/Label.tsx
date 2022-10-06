import TextField from '@mui/material/TextField'
import { ReactElement, FocusEvent } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { Formik, Form } from 'formik'
import Box from '@mui/material/Box'
import { noop } from 'lodash'
import { useTranslation } from 'react-i18next'
import { TextResponseLabelUpdate } from '../../../../../../../../../__generated__/TextResponseLabelUpdate'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/GetJourney'

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
  const { state } = useEditor()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleSubmit(e: FocusEvent): Promise<void> {
    if (journey == null || selectedBlock == null) return
    const target = e.target as HTMLInputElement
    await textResponseLabelUpdate({
      variables: {
        id: selectedBlock?.id,
        journeyId: journey.id,
        input: {
          label: target.value
        }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id: selectedBlock?.id,
          __typename: 'TextResponseBlock',
          label: target.value
        }
      }
    })
  }

  const initialValues =
    selectedBlock != null ? { textResponseLabel: selectedBlock.label } : null
  const maxCharacters = 16

  return (
    <Box sx={{ px: 6, py: 4 }}>
      {selectedBlock != null ? (
        <Formik initialValues={initialValues} onSubmit={noop}>
          {({ values, errors, handleChange, handleBlur, setValues }) => (
            <Form>
              <TextField
                id="textResponseLabel"
                name="textResponseLabel"
                variant="filled"
                label="Label"
                fullWidth
                value={values.textResponseLabel}
                placeholder={t('Your answer here')}
                inputProps={{ maxLength: maxCharacters }}
                helperText={t('Can only be {{maxCharacters}} characters', {
                  maxCharacters
                })}
                onChange={handleChange}
                onBlur={(e) => {
                  handleBlur(e)
                  if (values.textResponseLabel.trim() === '') {
                    e.target.value = t('Your answer here')
                    setValues({ textResponseLabel: t('Your answer here') })
                  }
                  errors.textResponseLabel == null && handleSubmit(e)
                }}
              />
            </Form>
          )}
        </Formik>
      ) : (
        <TextField
          variant="filled"
          label="Label"
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
