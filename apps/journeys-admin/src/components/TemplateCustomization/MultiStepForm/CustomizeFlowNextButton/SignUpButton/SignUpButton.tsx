import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { buildCustomizeUrl } from '../../../utils/customizationRoutes'
import { CustomizeFlowNextButton } from '../CustomizeFlowNextButton'

export function SignUpButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const journeyId = router.query.journeyId as string | undefined

  function handleClick(): void {
    const redirectUrl =
      journeyId != null
        ? buildCustomizeUrl(journeyId, 'media', undefined)
        : '/'

    void router.push({
      pathname: '/users/sign-in',
      query: { redirect: redirectUrl }
    })
  }

  return (
    <CustomizeFlowNextButton
      label={t('Sign Up')}
      ariaLabel={t('Sign Up')}
      onClick={handleClick}
    />
  )
}
