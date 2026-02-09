import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import Button from '@mui/material/Button'

export function SignUpButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { journey } = useJourney()

  function handleClick(): void {
    const domain =
      process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? window.location.origin
    const redirectUrl =
      journey?.id != null
        ? `${domain}/templates/${journey.id}/customize`
        : `${domain}/`

    void router.push(
      {
        pathname: `${domain}/users/sign-in`,
        query: { redirect: redirectUrl }
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <Button
      variant="contained"
      color="primary"
      aria-label={t('Sign Up')}
      onClick={handleClick}
    >
      {t('Sign Up')}
    </Button>
  )
}
