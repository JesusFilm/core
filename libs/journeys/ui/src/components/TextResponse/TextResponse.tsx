import { gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/system/styleFunctionSx'
import { useFormikContext } from 'formik'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { TextField } from '../TextField'

import { TextResponseFields } from './__generated__/TextResponseFields'

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
  uuid?: () => string
  editableSubmitLabel?: ReactElement
  sx?: SxProps
}

export const TextResponse = ({
  id: blockId,
  uuid = uuidv4,
  label,
  hint,
  minRows
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
      <Stack data-testid={`textResponse-${blockId}`}>
        <TextField
          id={`textResponse-field`}
          name={blockId}
          label={label === '' ? 'Your answer here' : label}
          value={currentValue}
          helperText={hint != null ? hint : ''}
          multiline
          disabled={isSubmitting}
          minRows={minRows ?? 3}
          onClick={(e) => e.stopPropagation()}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          inputProps={{
            maxLength: 1000,
            readOnly: selectedBlock !== undefined,
            sx: {
              pointerEvents: selectedBlock !== undefined ? 'none' : 'auto'
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
