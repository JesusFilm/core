import Button from '@mui/material/Button'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

interface TemplateEditButtonProps {
  journeyId: string
}

export function TemplateEditButton({
  journeyId
}: TemplateEditButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <Button
      LinkComponent={NextLink}
      href={`/publisher/${journeyId}`}
      startIcon={<Edit2Icon />}
      data-testid="TemplateEditButton"
    >
      {t('Edit')}
    </Button>
  )
}
