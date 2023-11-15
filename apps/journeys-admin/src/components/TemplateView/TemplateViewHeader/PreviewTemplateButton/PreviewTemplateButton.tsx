import Button from '@mui/material/Button'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface PreviewTemplateButtonProps {
  slug?: string
  isPublisher?: boolean
}

export function PreviewTemplateButton({
  slug,
  isPublisher
}: PreviewTemplateButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const link =
    isPublisher === true
      ? `/api/preview?slug=${slug ?? ''}`
      : `${
          process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'
        }/${slug ?? ''}`

  return (
    <Button
      variant="outlined"
      color="secondary"
      disabled={slug == null}
      href={link}
      target="_blank"
      data-testid="PreviewTemplateButton"
    >
      {t('Preview')}
    </Button>
  )
}
