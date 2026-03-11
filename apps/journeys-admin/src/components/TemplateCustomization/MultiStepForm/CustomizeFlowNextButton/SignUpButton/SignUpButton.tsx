import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { buildCustomizeUrl } from '../../../utils/customizationRoutes'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { getNextCustomizeScreen } from '../../../utils/getNextCustomizeScreen'
import { CustomizeFlowNextButton } from '../CustomizeFlowNextButton'

interface SignUpButtonProps {
  screens: CustomizationScreen[]
  currentScreen: CustomizationScreen
}

export function SignUpButton({
  screens,
  currentScreen
}: SignUpButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { journey } = useJourney()

  function handleClick(): void {
    const nextScreen = getNextCustomizeScreen(screens, currentScreen)
    const redirectUrl =
      nextScreen != null
        ? buildCustomizeUrl(journey?.id, nextScreen, undefined)
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
