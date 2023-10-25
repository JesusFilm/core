import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import { ChangeEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface FeaturedCheckboxProps {
  loading: boolean
  value: boolean
  name: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function FeaturedCheckbox({
  loading,
  value,
  name,
  onChange
}: FeaturedCheckboxProps): ReactElement {
  const { t } = useTranslation()

  return (
    <FormGroup data-testid="FeaturedCheckbox">
      <FormControlLabel
        control={
          <Checkbox
            sx={{ mr: 1 }}
            color="secondary"
            defaultChecked={value}
            onChange={onChange}
            disabled={loading}
            value={value}
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
