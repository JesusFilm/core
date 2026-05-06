import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface PreviewTemplateButtonProps {
  slug?: string
  isPublisher?: boolean
}

export function PreviewTemplateButton({
  slug,
  isPublisher
}: PreviewTemplateButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

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
