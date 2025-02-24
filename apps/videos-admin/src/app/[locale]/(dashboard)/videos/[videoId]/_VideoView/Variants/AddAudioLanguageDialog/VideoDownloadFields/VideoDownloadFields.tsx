import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Field, FormikValues, useFormikContext } from 'formik'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export function VideoDownloadFields(): ReactElement {
  const t = useTranslations()
  const { touched, errors, setFieldValue, values } =
    useFormikContext<FormikValues>()

  return (
    <>
      <FormControl fullWidth error={touched.quality && errors.quality != null}>
        <InputLabel>{t('Quality')}</InputLabel>
        <Field
          as={Select}
          data-testid="QualitySelect"
          id="quality"
          name="quality"
          label={t('Quality')}
          value={values.quality}
        >
          <MenuItem value="low">{t('Low')}</MenuItem>
          <MenuItem value="high">{t('High')}</MenuItem>
        </Field>
      </FormControl>

      <Stack direction="row" gap={2}>
        <TextField
          fullWidth
          label={t('Width')}
          name="width"
          type="number"
          value={values.width}
          onChange={async (e) => {
            await setFieldValue('width', parseInt(e.target.value))
          }}
          error={touched.width && errors.width != null}
          helperText={
            touched.width && errors.width ? (errors.width as string) : undefined
          }
        />
        <TextField
          fullWidth
          label={t('Height')}
          name="height"
          type="number"
          value={values.height}
          onChange={async (e) => {
            await setFieldValue('height', parseInt(e.target.value))
          }}
          error={touched.height && errors.height != null}
          helperText={
            touched.height && errors.height
              ? (errors.height as string)
              : undefined
          }
        />
      </Stack>
    </>
  )
}
