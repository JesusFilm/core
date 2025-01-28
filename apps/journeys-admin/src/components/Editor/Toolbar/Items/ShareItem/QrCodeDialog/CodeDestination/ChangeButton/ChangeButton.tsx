import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface ChangeButtonProps {
  disabled?: boolean
  showRedirectButton?: boolean
  handleClick?: () => void
}

export function ChangeButton({
  disabled = false,
  showRedirectButton = false,
  handleClick
}: ChangeButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Tooltip
        title={
          disabled
            ? t('Only the journey owner can change the QR code destination.')
            : ''
        }
      >
        <span>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClick}
            sx={{ borderRadius: 2 }}
            disabled={disabled}
          >
            {showRedirectButton ? t('Cancel') : t('Change')}
          </Button>
        </span>
      </Tooltip>
      {showRedirectButton && (
        <Button variant="contained" color="secondary" sx={{ borderRadius: 2 }}>
          {t('Redirect')}
        </Button>
      )}
    </>
  )
}
