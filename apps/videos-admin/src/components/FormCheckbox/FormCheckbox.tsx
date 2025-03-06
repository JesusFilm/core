import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useField } from 'formik'
import { ReactElement } from 'react'

interface FormCheckboxProps {
  name: string
  label: string
}

export function FormCheckbox({ name, label }: FormCheckboxProps): ReactElement {
  const [{ value, onChange, ...formikProps }, meta, { setValue }] =
    useField(name)

  const hasError = meta.error !== undefined && meta.touched

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await setValue(event.target.checked)
  }

  return (
    <FormControl error={hasError}>
      <FormControlLabel
        label={label}
        control={
          <Checkbox {...formikProps} onChange={handleChange} checked={value} />
        }
        sx={{ width: 'fit-content' }}
      />
    </FormControl>
  )
}
