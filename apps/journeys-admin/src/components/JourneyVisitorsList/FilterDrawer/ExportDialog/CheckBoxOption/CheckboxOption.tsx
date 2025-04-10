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

/**
 * A reusable checkbox component that combines MUI Checkbox with FormControlLabel
 * @param checked - Whether the checkbox is checked
 * @param onChange - Callback fired when checkbox state changes
 * @param label - Text label for the checkbox (will be translated)
 * @param onClick - Optional click handler for the entire component
 * @param indeterminate - Optional flag for indeterminate state (partially checked)
 */
export function CheckboxOption({
  checked,
  onChange,
  label,
  onClick,
  indeterminate
}: CheckboxOptionProps): ReactElement {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={label}
      onClick={onClick}
    />
  )
}
