import Button from '@mui/material/Button'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

interface SaveButtonProps {
  disabled?: boolean
}

export function SaveButton({
  disabled = false
}: SaveButtonProps): ReactElement {
  const t = useTranslations()

  return (
    <Button
      variant="contained"
      size="small"
      color={disabled ? 'info' : 'secondary'}
      type="submit"
      disabled={disabled}
    >
      {t('Save')}
    </Button>
  )
}
