import { Button, Stack, TextField } from '@mui/material'
import {
  HeadingMetadata,
  Headings
} from '../../SlideComponents/Headings/Headings'
import { SlideWrapper } from '../../SlideComponents/SlideWrapper'
import { useState } from 'react'

interface InputProps {
  headings: HeadingMetadata[]
  bgImage?: string
  bgColor?: string
  label: string
  initialValue?: string
  buttonText: string
  onSubmit: (value: string) => void
}

export function Input({
  headings,
  bgImage,
  bgColor,
  label,
  initialValue,
  buttonText,
  onSubmit
}: InputProps) {
  const [value, setValue] = useState(initialValue ?? '')

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim())
    }
  }

  return (
    <SlideWrapper bgImage={bgImage} bgColor={bgColor}>
      <Headings headings={headings} />
      <Stack
        spacing={4}
        sx={{ width: '100%', maxWidth: '600px', alignItems: 'center' }}
      >
        <TextField
          variant="standard"
          label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          // onKeyDown={handleKeyDown}
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '1.5rem',
              textAlign: 'center'
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!value.trim()}
          sx={{ minWidth: '200px' }}
        >
          {buttonText}
        </Button>
      </Stack>
    </SlideWrapper>
  )
}
