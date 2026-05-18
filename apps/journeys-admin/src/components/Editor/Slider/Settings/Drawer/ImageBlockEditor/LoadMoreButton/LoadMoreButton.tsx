import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

interface LoadMoreButtonProps {
  hasMore: boolean
  loading: boolean
  onClick: () => void
}

export function LoadMoreButton({
  hasMore,
  loading,
  onClick
}: LoadMoreButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={!hasMore || loading}
      loading={loading}
      startIcon={<Plus2Icon />}
      size="medium"
      fullWidth
    >
      {loading
        ? t('Loading...')
        : !hasMore
          ? t('No more to load')
          : t('Load More')}
    </Button>
  )
}
