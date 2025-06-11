import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useState } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

interface ColorOpacityFieldProps {
  color: string
  opacity: number
  onColorChange: (color: string) => Promise<void>
  onOpacityChange: (opacity: number) => void
  onEditClick: () => void
  'data-testid'?: string
}

export function ColorOpacityField({
  color,
  opacity,
  onColorChange,
  onOpacityChange,
  onEditClick,
  'data-testid': dataTestId
}: ColorOpacityFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [colorValue, setColorValue] = useState(color)
  const [opacityValue, setOpacityValue] = useState(opacity.toString())
  const [colorError, setColorError] = useState('')
  const [opacityError, setOpacityError] = useState('')

  const isValidHex = useCallback((value: string): boolean => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    return hexColorRegex.test(value)
  }, [])

  const handleColorChange = useCallback(
    async (value: string) => {
      setColorValue(value)
      if (isValidHex(value)) {
        setColorError('')
        await onColorChange(value)
      } else {
        setColorError(t('Invalid {{ HEX }} color code', { HEX: 'HEX' }))
      }
    },
    [isValidHex, onColorChange, t]
  )

  const handleOpacityChange = useCallback(
    (value: string) => {
      setOpacityValue(value)
      const numValue = Number(value)
      if (
        !isNaN(numValue) &&
        numValue >= 0 &&
        numValue <= 100 &&
        value !== ''
      ) {
        setOpacityError('')
        onOpacityChange(numValue)
      } else {
        setOpacityError(
          t('Invalid {{ OPACITY }} opacity value', { OPACITY: 'opacity' })
        )
      }
    },
    [onOpacityChange, t]
  )

  const handleColorKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        void handleColorChange(colorValue)
      }
    },
    [colorValue, handleColorChange]
  )

  const handleOpacityKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleOpacityChange(opacityValue)
      }
    },
    [opacityValue, handleOpacityChange]
  )

  return (
    <Formik
      initialValues={{
        color: color,
        opacity: opacity
      }}
      onSubmit={() => {
        console.log('submit')
      }}
    >
      <Form>
        <Stack direction="row" sx={{ height: 56 }}>
          <TextField
            value={colorValue}
            variant="filled"
            onChange={(e) => setColorValue(e.target.value)}
            onBlur={() => {
              void handleColorChange(colorValue)
            }}
            onKeyDown={handleColorKeyDown}
            error={!!colorError}
            hiddenLabel
            size="small"
            data-testid="bgColorTextField"
            sx={{
              flex: 1,
              height: '100%',
              '& .MuiFilledInput-root': {
                height: '100%',
                borderTopRightRadius: 0
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Edit2Icon
                      onClick={onEditClick}
                      style={{ cursor: 'pointer' }}
                    />
                  </InputAdornment>
                )
              }
            }}
          />
          <TextField
            value={opacityValue}
            variant="filled"
            onChange={(e) => setOpacityValue(e.target.value)}
            onBlur={() => handleOpacityChange(opacityValue)}
            onKeyDown={handleOpacityKeyDown}
            error={!!opacityError}
            hiddenLabel
            size="small"
            data-testid="bgOpacityTextField"
            sx={{
              width: 80,
              flexShrink: 0,
              height: '100%',
              '& .MuiFilledInput-root': {
                height: '100%',
                borderTopLeftRadius: 0
              },
              '& .MuiFilledInput-input': {
                textAlign: 'right'
              }
            }}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }
            }}
          />
        </Stack>
      </Form>
    </Formik>
  )
}
