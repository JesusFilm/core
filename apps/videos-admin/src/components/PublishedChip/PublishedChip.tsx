import Chip from '@mui/material/Chip'
import { ReactElement } from 'react'
import { useTranslations } from 'next-intl'

interface PublishedChipProps {
  published: boolean
}

export function PublishedChip({ published }: PublishedChipProps): ReactElement {
  const t = useTranslations()

  return (
    <Chip
      label={published ? t('Published') : t('Unpublished')}
      color={published ? 'success' : 'warning'}
    />
  )
}
