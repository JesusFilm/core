import Button from '@mui/material/Button'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

interface SaveButtonProps {
  disabled: boolean
}

export function SaveButton({ disabled }: SaveButtonProps): ReactElement {
  const t = useTranslations()

  return (
    <Button
      variant="contained"
      size="large"
      color="secondary"
      type="submit"
      disabled={disabled}
      sx={{
        width: 100
      }}
    >
      {t('Save')}
    </Button>
  )
}
