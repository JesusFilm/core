import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import { ChangeEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface FeaturedCheckboxProps {
  loading: boolean
  values: boolean
  name: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function FeaturedCheckbox({
  loading,
  values,
  name,
  onChange
}: FeaturedCheckboxProps): ReactElement {
  const { t } = useTranslation()

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            sx={{ mr: 1 }}
            color="secondary"
            defaultChecked={values}
            onChange={onChange}
            disabled={loading}
            value={values}
            name={name}
          />
        }
        componentsProps={{
          typography: { color: 'secondary.main', variant: 'subtitle2' }
        }}
        label={t('Featured')}
      />
    </FormGroup>
  )
}
