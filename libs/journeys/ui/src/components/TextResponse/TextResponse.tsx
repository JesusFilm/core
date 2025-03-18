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

  const { values, handleChange, handleBlur, isSubmitting } = useFormikContext<{
    [key: string]: string
  }>()

  const {
    state: { selectedBlock }
  } = useEditor()

  const currentValue = values[blockId] || ''

  useEffect(() => {
    if (currentValue !== value) {
      setValue(currentValue)
    }
  }, [currentValue, value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e)
    setValue(e.target.value)
  }

  return (
    <Box sx={{ mb: 4 }} data-testid="JourneysTextResponse">
      <Stack data-testid={`textResponse-${blockId}`}>
        <TextField
          id={`textResponse-field-${blockId}`}
          name={blockId}
          label={label === '' ? 'Your answer here' : label}
          value={currentValue}
          helperText={hint != null ? hint : ''}
          multiline
          disabled={isSubmitting}
          minRows={minRows ?? 3}
          onClick={(e) => e.stopPropagation()}
          onChange={handleInputChange}
          onBlur={handleBlur}
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
