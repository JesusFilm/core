import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Button from '@mui/material/Button'

export function SignUpButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const journeyId = router.query.journeyId as string | undefined

  function handleClick(): void {
    const domain =
      process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? window.location.origin
    const redirectUrl =
      journeyId != null
        ? `${domain}/templates/${journeyId}/customize`
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
