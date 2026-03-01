import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { useEffect } from 'react'

import {
  CUSTOMIZE_SCREEN_QUERY_KEY,
  buildCustomizeUrl,
  getFirstGuestAllowedScreen,
  isScreenAllowedForGuest
} from '../customizationRoutes'
import type { CustomizationScreen } from '../getCustomizeFlowConfig'

export interface UseTemplateCustomizationRedirectParams {
  journeyId: string
  screens: CustomizationScreen[]
  activeScreen: CustomizationScreen
  isGuest: boolean
  guestFlowEnabled: boolean
}

/**
 * Handles all redirects for the template customization flow:
 * 1. Syncs URL with a valid screen (redirects to first screen if missing/invalid).
 * 2. For guests: redirects away from non-guest screens or when guest flow is disabled.
 */
export function useTemplateCustomizationRedirect({
  journeyId,
  screens,
  activeScreen,
  isGuest,
  guestFlowEnabled
}: UseTemplateCustomizationRedirectParams): void {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  // 1. Validate screen from URL; redirect to first screen if missing or invalid
  useEffect(() => {
    if (!router.isReady || !journeyId || screens.length === 0) return

    const screenQuery = router.query[CUSTOMIZE_SCREEN_QUERY_KEY]
    const rawScreen =
      typeof screenQuery === 'string'
        ? screenQuery
        : Array.isArray(screenQuery)
          ? screenQuery[0]
          : undefined

    const isMissingScreen = rawScreen == null || rawScreen === ''
    const isInvalidScreen =
      rawScreen != null &&
      rawScreen !== '' &&
      !screens.includes(rawScreen as CustomizationScreen)

    if (isMissingScreen || isInvalidScreen) {
      if (isInvalidScreen) {
        enqueueSnackbar(
          t(
            'Invalid customization step. You have been redirected to the first step.'
          ),
          { variant: 'error', preventDuplicate: true }
        )
      }
      void router.replace(buildCustomizeUrl(journeyId, screens[0], undefined))
    }
  }, [
    router,
    router.isReady,
    journeyId,
    router.query[CUSTOMIZE_SCREEN_QUERY_KEY],
    screens,
    t,
    enqueueSnackbar
  ])

  // 2. For guests: redirect if guest flow disabled or current screen not allowed
  useEffect(() => {
    if (!router.isReady || !journeyId || !isGuest) return

    if (!guestFlowEnabled || !isScreenAllowedForGuest(activeScreen)) {
      enqueueSnackbar(
        t('This step is not available for guests. You have been redirected.'),
        { variant: 'error', preventDuplicate: true }
      )
      void router.replace(
        buildCustomizeUrl(journeyId, getFirstGuestAllowedScreen(), true)
      )
    }
  }, [
    router,
    router.isReady,
    journeyId,
    isGuest,
    guestFlowEnabled,
    activeScreen,
    t,
    enqueueSnackbar
  ])
}
