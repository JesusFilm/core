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
      label={published ? t('Published') : t('Unpublished')}
      color={published ? 'success' : 'warning'}
    />
  )
}
