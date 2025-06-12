import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useState } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import {
  addAlphaToHex,
  getOpacityFromHex,
  isValidHex,
  stripAlphaFromHex
} from './ColorOpacityUtils'

interface ColorOpacityFieldProps {
  color: string
  onColorChange: (color: string) => Promise<void>
  onEditClick: () => void
  'data-testid'?: string
}

export function ColorOpacityField({
  color,
  onColorChange,
  onEditClick,
  'data-testid': dataTestId
}: ColorOpacityFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const initialColorValue = stripAlphaFromHex(color)
  const initialOpacityValue = getOpacityFromHex(color) ?? 50

  const validateAndSubmit = useCallback(
    async (
      values: { color: string; opacity: number },
      { setFieldValue }: any
    ) => {
      const { color: inputColor, opacity: inputOpacity } = values

      // Validate color
      const isColorValid = inputColor.trim() !== '' && isValidHex(inputColor)
      // Validate opacity
      const isOpacityValid =
        !isNaN(inputOpacity) && inputOpacity >= 0 && inputOpacity <= 100

      // If color is invalid, reset it to the previous valid value
      if (!isColorValid) {
        setFieldValue('color', initialColorValue)
      }

      // If opacity is invalid, reset it to the previous valid value
      if (!isOpacityValid) {
        setFieldValue('opacity', initialOpacityValue)
      }

      // Only proceed with color change if both values are valid
      if (isColorValid && isOpacityValid) {
        const combinedColorWithOpacity = addAlphaToHex(inputColor, inputOpacity)
        await onColorChange(combinedColorWithOpacity)
      }
    },
    [onColorChange, initialColorValue, initialOpacityValue]
  )

  const handleColorBlur = useCallback(
    (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
      formikProps: any
    ) => {
      const value = e.target.value
      if (value.trim() !== '' && !isValidHex(value)) {
        formikProps.setFieldValue('color', initialColorValue)
      } else if (isValidHex(value) && value.length === 9) {
        // If it's a valid 8-digit hex, update the opacity field too
        const extractedOpacity = getOpacityFromHex(value)
        formikProps.setFieldValue('opacity', extractedOpacity)
        // Strip alpha and show base color in the color field
        const baseColor = stripAlphaFromHex(value)
        formikProps.setFieldValue('color', baseColor)
      }
      formikProps.handleSubmit()
    },
    [initialColorValue]
  )

  const handleColorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, formikProps: any) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLInputElement
        const value = target.value
        if (isValidHex(value) && value.length === 9) {
          // If it's a valid 8-digit hex, update the opacity field too
          const extractedOpacity = getOpacityFromHex(value)
          formikProps.setFieldValue('opacity', extractedOpacity)
          // Strip alpha and show base color in the color field
          const baseColor = stripAlphaFromHex(value)
          formikProps.setFieldValue('color', baseColor)
        }
        formikProps.handleSubmit()
      }
    },
    []
  )

  const handleOpacityBlur = useCallback(
    (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
      formikProps: any
    ) => {
      const value = parseFloat(e.target.value)
      if (isNaN(value) || value < 0 || value > 100) {
        formikProps.setFieldValue('opacity', initialOpacityValue)
      }
      formikProps.handleSubmit()
    },
    [initialOpacityValue]
  )

  return (
    <Formik
      initialValues={{
        color: initialColorValue,
        opacity: initialOpacityValue
      }}
      enableReinitialize
      onSubmit={validateAndSubmit}
    >
      {({ values, handleSubmit, handleChange, setFieldValue }) => (
        <Form onSubmit={handleSubmit}>
          <Stack direction="row" sx={{ height: 56 }}>
            <TextField
              name="color"
              value={values.color}
              variant="filled"
              onChange={handleChange}
              onBlur={(e) =>
                handleColorBlur(e, { setFieldValue, handleSubmit })
              }
              onKeyDown={(e) =>
                handleColorKeyDown(e, { setFieldValue, handleSubmit })
              }
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
                  inputProps: {
                    maxLength: 9
                  },
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
              name="opacity"
              value={values.opacity}
              variant="filled"
              onChange={handleChange}
              onBlur={(e) =>
                handleOpacityBlur(e, { setFieldValue, handleSubmit })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
              hiddenLabel
              size="small"
              data-testid="bgOpacityTextField"
              sx={{
                width: 72,
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
                  inputProps: {
                    maxLength: 3
                  },
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  )
                }
              }}
            />
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
