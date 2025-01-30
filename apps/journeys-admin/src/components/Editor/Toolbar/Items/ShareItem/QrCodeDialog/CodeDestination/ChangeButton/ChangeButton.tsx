import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface ChangeButtonProps {
  disabled?: boolean
  showRedirectButton?: boolean
  handleClick?: () => void
  handleRedirect?: () => void
}

export function ChangeButton({
  disabled = false,
  showRedirectButton = false,
  handleClick,
  handleRedirect
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
            size="medium"
            onClick={handleClick}
            disabled={disabled}
          >
            {showRedirectButton ? t('Cancel') : t('Change')}
          </Button>
        </span>
      </Tooltip>
      {showRedirectButton && (
        <Button
          variant="contained"
          color="secondary"
          size="medium"
          onClick={handleRedirect}
        >
          {t('Redirect')}
        </Button>
      )}
    </>
  )
}
