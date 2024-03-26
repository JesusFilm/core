import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface ClearAllProps {
  handleClearAll?: () => void
}

export const ClearAllButton = ({
  handleClearAll
}: ClearAllProps): ReactElement => {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="small"
      onClick={handleClearAll}
      sx={{
        ml: 5,
        mb: 1
      }}
      data-testid="ClearAllButton"
    >
      {t('Clear all')}
    </Button>
  )
}
