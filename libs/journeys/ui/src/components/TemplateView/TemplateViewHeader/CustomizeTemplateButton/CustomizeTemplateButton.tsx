import Button from '@mui/material/Button'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface CustomizeTemplateButtonProps {
  journeyId?: string
}

export function CustomizeTemplateButton({
  journeyId
}: CustomizeTemplateButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const link = `/templates/${journeyId ?? ''}/customize`

  return (
    <NextLink href={link} passHref legacyBehavior>
      <Button
        variant="outlined"
        color="secondary"
        disabled={journeyId == null}
        data-testid="CustomizeTemplateButton"
      >
        {t('Customize')}
      </Button>
    </NextLink>
  )
}
