import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement, useState } from 'react'

import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import { Form, Formik, FormikValues } from 'formik'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

interface ConfigFieldProps {
  label: string
  value?: string
  onChange: (value?: string) => void
}

export function ConfigField({
  label,
  value,
  onChange: handleChange
}: ConfigFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [visible, setVisible] = useState(false)
  const [hover, setHover] = useState(false)

  function handleIconClick(e: MouseEvent): void {
    e.stopPropagation()
    setVisible(!visible)
  }

  function handleSubmit(values: FormikValues): void {
    handleChange(values.value)
  }

  const validationSchema = object({
    value: string().required(t('This field is required'))
  })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
      }}
    >
      <Typography variant="body1" sx={{ flex: 0.2 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 0.8, position: 'relative', width: '100%' }}>
        <Formik
          initialValues={{ value }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, setFieldValue }) => (
            <Form>
              <TextField
                type={visible ? 'text' : 'password'}
                value={hover && !visible ? '' : values.value}
                onChange={(e) => setFieldValue('value', e.target.value)}
                onClick={() => setVisible(true)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                error={Boolean(errors.value)}
                helperText={<>{errors.value}</>}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleIconClick}>
                        {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  width: '100%'
                }}
              />
              {hover && !visible && (
                <Typography
                  variant="body1"
                  sx={{
                    position: 'absolute',
                    top: 'calc(50% - 12px)',
                    left: 14,
                    transform: 'translateY(-50)',
                    pointerEvents: 'none',
                    color: (theme) => theme.palette.grey[500]
                  }}
                >
                  {t('Click to reveal the secret')}
                </Typography>
              )}
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  )
}
