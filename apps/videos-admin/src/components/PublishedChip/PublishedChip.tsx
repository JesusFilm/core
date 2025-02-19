import Chip from '@mui/material/Chip'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

interface PublishedChipProps {
  published: boolean
}

export function PublishedChip({ published }: PublishedChipProps): ReactElement {
  const t = useTranslations()

  return (
    <Chip
      data-testid="PublishedChip"
      label={published ? t('Published') : t('Draft')}
      color={published ? 'success' : 'warning'}
    />
  )
}
