import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ChangeEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface FeaturedCheckboxProps {
  loading: boolean
  values: boolean
  name: string
  handleChange: (e: ChangeEvent<unknown>) => void
}

export function FeaturedCheckbox({
  loading,
  values,
  name,
  handleChange
}: FeaturedCheckboxProps): ReactElement {
  const { t } = useTranslation()

  return (
    <Stack direction="row" alignItems="center">
      <Checkbox
        sx={{ mr: 1, ml: -2 }}
        color="secondary"
        defaultChecked={values}
        onChange={handleChange}
        disabled={loading}
        value={values}
        name={name}
      />
      <Typography sx={{ color: 'secondary.main' }} variant="subtitle2">
        {t('Mark as Featured')}
      </Typography>
    </Stack>
  )
}
