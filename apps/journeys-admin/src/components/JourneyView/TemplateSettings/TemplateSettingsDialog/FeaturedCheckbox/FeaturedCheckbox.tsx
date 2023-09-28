import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { ChangeEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface FeaturedCheckboxProps {
  loading: boolean
  values: boolean
  name: string
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function FeaturedCheckbox({
  loading,
  values,
  name,
  handleChange
}: FeaturedCheckboxProps): ReactElement {
  const { t } = useTranslation()

  return (
    <FormControlLabel
      control={
        <Checkbox
          sx={{ mr: 1 }}
          color="secondary"
          defaultChecked={values}
          onChange={handleChange}
          disabled={loading}
          value={values}
          name={name}
        />
      }
      componentsProps={{
        typography: { color: 'secondary.main', variant: 'subtitle2' }
      }}
      label={t('Mark as Featured')}
    />
  )
}
