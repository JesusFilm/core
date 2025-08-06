import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Field, Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { formItemSchema } from '../../../../../../libs/ai/tools/client/requestForm/requestForm'

type FormItem = z.infer<typeof formItemSchema>

function getStringValidator(
  item: FormItem
): z.ZodString | z.ZodOptional<z.ZodString> {
  let validator = z.string()
  switch (item.type) {
    case 'email':
      validator = validator.email('Invalid email address')
      break
    case 'url':
      validator = validator.url('Invalid URL')
      break
    case 'tel':
      validator = validator.regex(/^[+\d\s().-]{7,}$/, 'Invalid phone number')
      break
  }
  if (item.required) {
    return validator.min(1, 'Required')
  } else {
    return validator.optional()
  }
}

function getNumberValidator(
  item: FormItem
): z.ZodNumber | z.ZodOptional<z.ZodNumber> {
  const validator = z.coerce.number()
  if (!item.required) return validator.optional()

  return validator
}

function getCheckboxValidator(
  item: FormItem
): z.ZodBoolean | z.ZodOptional<z.ZodBoolean> {
  const validator = z.boolean()
  if (!item.required) return validator.optional()

  return validator
}

function getItemValidator(item: FormItem): z.ZodTypeAny {
  switch (item.type) {
    case 'number':
      return getNumberValidator(item)
    case 'checkbox':
      return getCheckboxValidator(item)
    case 'email':
    case 'url':
    case 'tel':
    default:
      return getStringValidator(item)
  }
}

function buildValidationSchema(formItems: any[]) {
  const shape: Record<string, any> = {}
  const items = z.array(formItemSchema).parse(formItems)

  for (const item of items) {
    shape[item.name] = getItemValidator(item)
  }
  return z.object(shape)
}
interface RequestFormToolProps {
  part: ToolInvocationUIPart
  addToolResult: ({
    toolCallId,
    result
  }: {
    toolCallId: string
    result: any
  }) => void
}

export function RequestFormTool({
  part: { toolInvocation },
  addToolResult
}: RequestFormToolProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const formItems = z
    .array(formItemSchema)
    .parse(toolInvocation.args?.formItems || [])

  // Build initial values for Formik
  const initialValues = formItems.reduce(
    (acc: Record<string, any>, item: any) => {
      switch (item.type) {
        case 'checkbox':
          acc[item.name] = false
          break
        default:
          acc[item.name] = ''
      }
      return acc
    },
    {}
  )

  const validationSchema = toFormikValidationSchema(
    buildValidationSchema(formItems)
  )

  const handleSubmit = (values: Record<string, any>) => {
    addToolResult({
      toolCallId: toolInvocation.toolCallId,
      result: values
    })
  }

  switch (toolInvocation.state) {
    case 'call':
      return (
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {({ values, handleChange, setFieldValue, errors, touched }) => (
            <Form>
              <Stack gap={2} maxWidth="80%" mt={4}>
                {formItems.map((item: any) => {
                  const fieldError = errors[item.name]
                  const fieldTouched = touched[item.name]
                  const showError = fieldTouched && fieldError
                  const showSuggestion =
                    typeof item.suggestion === 'string' &&
                    item.suggestion.length > 0
                  const handleSuggestion = () =>
                    setFieldValue(item.name, item.suggestion)
                  switch (item.type) {
                    case 'text':
                    case 'number':
                    case 'textarea':
                    case 'email':
                    case 'tel':
                    case 'url':
                      return (
                        <Box key={item.name}>
                          <Field
                            as={TextField}
                            name={item.name}
                            label={item.label}
                            type={
                              item.type === 'number'
                                ? 'number'
                                : item.type === 'email'
                                  ? 'email'
                                  : item.type === 'tel'
                                    ? 'tel'
                                    : item.type === 'url'
                                      ? 'url'
                                      : 'text'
                            }
                            required={item.required}
                            placeholder={item.placeholder}
                            multiline={item.type === 'textarea'}
                            minRows={item.type === 'textarea' ? 3 : undefined}
                            inputProps={{
                              'aria-label': item.label,
                              tabIndex: 0
                            }}
                            helperText={
                              showError ? fieldError : item.helperText
                            }
                            error={Boolean(showError)}
                            fullWidth
                          />
                          {showSuggestion && (
                            <Chip
                              label={item.suggestion}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 1, mb: 4, ml: 2, cursor: 'pointer' }}
                              onClick={handleSuggestion}
                              aria-label={`Use suggestion for ${item.label}`}
                            />
                          )}
                        </Box>
                      )
                    case 'select':
                      return (
                        <FormControl
                          key={item.name}
                          fullWidth
                          required={item.required}
                        >
                          <FormLabel id={`label-${item.name}`}>
                            {item.label}
                          </FormLabel>
                          <Select
                            labelId={`label-${item.name}`}
                            id={item.name}
                            name={item.name}
                            value={values[item.name] || ''}
                            onChange={handleChange}
                            inputProps={{
                              'aria-label': item.label,
                              tabIndex: 0
                            }}
                            error={Boolean(fieldTouched && fieldError)}
                          >
                            {item.options?.map((option: any) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <Typography
                            variant="caption"
                            color={showError ? 'error' : 'text.secondary'}
                          >
                            {showError ? fieldError : item.helperText}
                          </Typography>
                        </FormControl>
                      )
                    case 'checkbox':
                      return (
                        <FormGroup key={item.name}>
                          <FormControlLabel
                            control={
                              <Field
                                as={Checkbox}
                                name={item.name}
                                checked={values[item.name]}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setFieldValue(item.name, e.target.checked)}
                                inputProps={{
                                  'aria-label': item.label,
                                  tabIndex: 0
                                }}
                              />
                            }
                            label={item.label}
                          />
                          <Typography
                            variant="caption"
                            color={showError ? 'error' : 'text.secondary'}
                          >
                            {showError ? fieldError : item.helperText}
                          </Typography>
                        </FormGroup>
                      )
                    case 'radio':
                      return (
                        <FormControl
                          key={item.name}
                          component="fieldset"
                          required={item.required}
                          error={Boolean(fieldTouched && fieldError)}
                        >
                          <FormLabel component="legend">{item.label}</FormLabel>
                          <RadioGroup
                            aria-label={item.label}
                            name={item.name}
                            value={values[item.name] || ''}
                            onChange={handleChange}
                          >
                            {item.options?.map((option: any) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio tabIndex={0} />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                          <Typography
                            variant="caption"
                            color={showError ? 'error' : 'text.secondary'}
                          >
                            {showError ? fieldError : item.helperText}
                          </Typography>
                        </FormControl>
                      )
                    default:
                      return null
                  }
                })}
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    aria-label={t('Submit form')}
                  >
                    {t('Submit')}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    sx={{ ml: 2 }}
                    aria-label={t('Cancel form')}
                    onClick={() => {
                      addToolResult({
                        toolCallId: toolInvocation.toolCallId,
                        result: { cancelled: true }
                      })
                    }}
                  >
                    {t('Cancel')}
                  </Button>
                </Box>
              </Stack>
            </Form>
          )}
        </Formik>
      )
    case 'result':
      if (toolInvocation.result?.cancelled) {
        return (
          <Box maxWidth="80%">
            <Chip label={t('Form was cancelled')} size="small" />
          </Box>
        )
      }
      return (
        <List sx={{ p: 0 }}>
          {formItems.map((item) => {
            const value = toolInvocation.result?.[item.name]
            let displayValue: React.ReactNode = '—'
            if (item.type === 'checkbox') {
              displayValue = value ? t('Yes') : t('No')
            } else if (value !== undefined && value !== null && value !== '') {
              displayValue = value
            }
            return (
              <ListItem key={item.name} dense disableGutters>
                <ListItemText primary={item.label} secondary={displayValue} />
              </ListItem>
            )
          })}
        </List>
      )
    default:
      return null
  }
}
