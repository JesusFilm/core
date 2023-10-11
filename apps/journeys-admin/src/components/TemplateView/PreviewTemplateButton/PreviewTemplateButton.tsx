import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
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
  const router = useRouter()
  const { data } = useUserRoleQuery()

  function handleClick(): void {
    if (slug == null) return
    const isPublisher =
      data?.getUserRole?.roles?.includes(Role.publisher) === true

    if (isPublisher) {
      void router.push(`/api/preview?slug=${slug}`)
    } else {
      window.open(`${process.env.JOURNEYS_URL as string}/${slug}`)
    }
  }

  return (
    <Button
      variant="outlined"
      color="secondary"
      disabled={slug == null}
      onClick={handleClick}
    >
      {t('Preview')}
    </Button>
  )
}
