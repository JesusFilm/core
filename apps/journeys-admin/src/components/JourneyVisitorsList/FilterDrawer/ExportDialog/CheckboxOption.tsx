import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface CheckboxOptionProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  onClick?: (e: React.MouseEvent) => void
  indeterminate?: boolean
}

export function CheckboxOption({
  checked,
  onChange,
  label,
  onClick,
  indeterminate
}: CheckboxOptionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={t(label)}
      onClick={onClick}
    />
  )
}
