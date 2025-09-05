import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikContextType, FormikHelpers } from 'formik'
import { ReactElement } from 'react'

import {
  addAlphaToHex,
  getOpacityFromHex,
  isValidHex,
  stripAlphaFromHex
} from '@core/journeys/ui/Card/utils/colorOpacityUtils'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

interface ColorOpacityFieldProps {
  color: string
  onColorChange: (color: string) => Promise<void>
  isContained?: boolean
}

interface FormValues {
  color: string
  opacity: number
}

type FormikHandlers = Pick<
  FormikContextType<FormValues>,
  'setFieldValue' | 'handleSubmit'
>

export function ColorOpacityField({
  color,
  onColorChange,
  isContained = false
}: ColorOpacityFieldProps): ReactElement {
  const initialColorValue = stripAlphaFromHex(color)
  const initialOpacityValue = getOpacityFromHex(color)

  async function validateAndSubmit(
    values: FormValues,
    { setFieldValue }: FormikHelpers<FormValues>
  ): Promise<void> {
    const { color: inputColor, opacity: inputOpacity } = values
    const isColorValid = isValidHex(inputColor)
    const isOpacityValid =
      !isNaN(inputOpacity) && inputOpacity >= 0 && inputOpacity <= 100

    if (!isColorValid) {
      void setFieldValue('color', initialColorValue)
    }

    if (!isOpacityValid) {
      void setFieldValue('opacity', initialOpacityValue)
    }

    if (isColorValid && isOpacityValid) {
      const combinedColorWithOpacity = addAlphaToHex(inputColor, inputOpacity)
      await onColorChange(combinedColorWithOpacity)
    }
  }

  function validateAndExtractColor(
    value: string,
    { setFieldValue }: FormikHandlers
  ): boolean {
    if (isValidHex(value)) {
      const baseColor = stripAlphaFromHex(value)
      const extractedOpacity = getOpacityFromHex(value)
      void setFieldValue('color', baseColor)
      void setFieldValue('opacity', extractedOpacity)
      return true
    }
    return false
  }

  function validateOpacity(
    value: string,
    { setFieldValue }: FormikHandlers
  ): boolean {
    const parsedOpacity = parseInt(value, 10)
    if (isNaN(parsedOpacity) || parsedOpacity < 0 || parsedOpacity > 100) {
      void setFieldValue('opacity', initialOpacityValue)
      return false
    }
    return true
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLDivElement>,
    formikHandlers: FormikHandlers,
    validator: (value: string, handlers: FormikHandlers) => boolean
  ) {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement
      const isValid = validator(target.value, formikHandlers)
      if (!isValid) {
        const initialValue =
          target.name === 'color' ? initialColorValue : initialOpacityValue
        void formikHandlers.setFieldValue(target.name, initialValue)
        return
      }
      formikHandlers.handleSubmit()
    }
  }

  function handleColorBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    formikHandlers: FormikHandlers
  ): void {
    const { handleSubmit } = formikHandlers
    if (!validateAndExtractColor(e.target.value, formikHandlers)) {
      void formikHandlers.setFieldValue('color', initialColorValue)
      return
    }
    handleSubmit()
  }

  function handleOpacityBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    formikHandlers: FormikHandlers
  ): void {
    if (!validateOpacity(e.target.value, formikHandlers)) {
      void formikHandlers.setFieldValue('opacity', initialOpacityValue)
      return
    }
    formikHandlers.handleSubmit()
  }

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
          <Stack
            direction="row"
            sx={{ height: 56 }}
            data-testid="ColorOpacityField"
          >
            <TextField
              name="color"
              value={values.color}
              variant="filled"
              onChange={handleChange}
              onBlur={(e) =>
                handleColorBlur(e, { setFieldValue, handleSubmit })
              }
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  { setFieldValue, handleSubmit },
                  validateAndExtractColor
                )
              }
              hiddenLabel
              size="small"
              data-testid="bgColorTextField"
              sx={{
                flex: 1
              }}
              slotProps={{
                input: {
                  inputProps: {
                    maxLength: 9
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Edit2Icon style={{ cursor: 'pointer' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    height: '100%',
                    borderTopRightRadius: 0
                  }
                }
              }}
            />
            {!isContained && (
              <TextField
                name="opacity"
                value={values.opacity}
                variant="filled"
                onChange={handleChange}
                onBlur={(e) =>
                  handleOpacityBlur(e, { setFieldValue, handleSubmit })
                }
                onKeyDown={(e) =>
                  handleKeyDown(
                    e,
                    { setFieldValue, handleSubmit },
                    validateOpacity
                  )
                }
                hiddenLabel
                size="small"
                data-testid="bgOpacityTextField"
                sx={{
                  width: 72,
                  flexShrink: 0
                }}
                slotProps={{
                  input: {
                    inputProps: {
                      maxLength: 3
                    },
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                    sx: {
                      height: '100%',
                      borderTopLeftRadius: 0,
                      textAlign: 'right'
                    }
                  }
                }}
              />
            )}
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
