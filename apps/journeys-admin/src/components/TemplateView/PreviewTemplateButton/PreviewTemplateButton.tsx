import Button from '@mui/material/Button'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Role } from '../../../../__generated__/globalTypes'
import { useUserRoleQuery } from '../../../libs/useUserRoleQuery'

interface PreviewTemplateButtonProps {
  slug?: string
}

export function PreviewTemplateButton({
  slug
}: PreviewTemplateButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useUserRoleQuery()
  const isPublisher =
    data?.getUserRole?.roles?.includes(Role.publisher) === true

  const link = isPublisher
    ? `/api/preview?slug=${slug ?? ''}`
    : `${process.env.JOURNEYS_URL ?? 'https://your.nextstep.is'}/${slug ?? ''}`

  return (
    <Button
      variant="outlined"
      color="secondary"
      disabled={slug == null}
      href={link}
      target="_blank"
    >
      {t('Preview')}
    </Button>
  )
}
