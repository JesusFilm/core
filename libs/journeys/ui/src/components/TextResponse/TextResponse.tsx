import { gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/system/styleFunctionSx'
import { useFormikContext } from 'formik'
import { ReactElement, useEffect, useState } from 'react'

import { TextResponseType } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { TextField } from '../TextField'

import { TextResponseFields } from './__generated__/TextResponseFields'

/**
 * GraphQL mutation for creating a text response submission event.
 */
export const TEXT_RESPONSE_SUBMISSION_EVENT_CREATE = gql`
  mutation TextResponseSubmissionEventCreate(
    $input: TextResponseSubmissionEventCreateInput!
  ) {
    textResponseSubmissionEventCreate(input: $input) {
      id
    }
  }
`

interface TextResponseProps extends TreeBlock<TextResponseFields> {
  editableSubmitLabel?: ReactElement
  sx?: SxProps
}

/**
 * TextResponse component - A form field for collecting text responses from users.
 *
 * This component integrates with Formik for form state management and validation.
 * It displays a text field where users can input multi-line responses.
 * The component handles both controlled and uncontrolled state scenarios.
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the block (blockId), used as the form field name
 * @param {string} props.label - Label text for the input field, defaults to 'Your answer here' if empty
 * @param {string} [props.hint] - Optional helper text displayed below the input
 * @param {number} [props.minRows] - Minimum number of rows for the multiline text field, defaults to 3
 *
 * @returns {ReactElement} The rendered TextResponse component
 */
export const TextResponse = ({
  id: blockId,
  label,
  placeholder,
  hint,
  minRows,
  type,
  required
}: TextResponseProps): ReactElement => {
  const [value, setValue] = useState('')

  const formikContext = useFormikContext<{
    [key: string]: string
  }>()

  const {
    state: { selectedBlock }
  } = useEditor()

  const formikValue = formikContext?.values?.[blockId] ?? ''
  const isSubmitting = formikContext?.isSubmitting ?? false
  const handleChange = formikContext?.handleChange
  const handleBlur = formikContext?.handleBlur

  const currentValue = formikValue ?? value
  const trimmedPlaceholder =
    placeholder != null ? placeholder.trim().replace(/\s+/g, ' ') : ''

  useEffect(() => {
    if (formikContext != null && formikValue !== value) {
      setValue(formikValue)
    }
  }, [formikContext, formikValue, value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (handleChange != null) {
      handleChange(e)
    }
    setValue(e.target.value)
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (handleBlur != null) {
      handleBlur(e)
    }
  }

  return (
    <Box sx={{ mb: 4 }} data-testid="JourneysTextResponse">
      <Stack
        data-testid={`textResponse-${blockId}`}
        flexDirection="column"
        spacing={1}
      >
        <Typography
          id={`textResponse-label-${blockId}`}
          variant="subtitle2"
          sx={{
            fontSize: 14
          }}
        >
          {label.trim() === '' ? 'Label' : label}
          {(required ?? false) ? '*' : ''}
        </Typography>
        <TextField
          id={`textResponse-field`}
          name={blockId}
          placeholder={trimmedPlaceholder}
          value={currentValue}
          helperText={hint != null ? hint : ''}
          multiline
          disabled={isSubmitting}
          minRows={minRows ?? 1}
          onClick={(e) => e.stopPropagation()}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          slotProps={{
            htmlInput: {
              'aria-labelledby': `textResponse-label-${blockId}`,
              maxLength: 1000,
              readOnly: selectedBlock !== undefined,
              inputMode: type === TextResponseType.phone ? 'tel' : 'text',
              sx: {
                pointerEvents: selectedBlock !== undefined ? 'none' : 'auto',
                pt: 2,
                pb: 1
              }
            },
            input: {
              sx: {
                pt: 0
              }
            }
          }}
          sx={{
            '&.MuiTextField-root': {
              mb: 0
            }
          }}
        />
      </Stack>
    </Box>
  )
}
