import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

interface LoadMoreButtonProps {
  hasMore: boolean
  loading: boolean
  onClick: () => Promise<void>
}

export function LoadMoreButton({
  hasMore,
  loading,
  onClick
}: LoadMoreButtonProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  if (!hasMore && !loading) return null

  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={loading}
      loading={loading}
      startIcon={<Plus2Icon />}
      size="medium"
      fullWidth
    >
      {loading ? t('Loading...') : t('Load More')}
    </Button>
  )
}
