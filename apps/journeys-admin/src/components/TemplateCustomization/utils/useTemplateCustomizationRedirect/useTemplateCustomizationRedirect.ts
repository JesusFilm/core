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
  /**
   * Whether the journey has any customisable content (text, links, or media).
   * When the journey is loaded and this is false, the user is redirected back
   * to the template detail page — the journey.customizable flag may be stale
   * relative to what the step-level checks can resolve.
   * Pass undefined while the journey is still loading.
   */
  hasAnyContent: boolean | undefined
}

/**
 * Handles all redirects for the template customization flow:
 * 1. Syncs URL with a valid screen (redirects to first screen if missing/invalid).
 * 2. For guests: redirects away from non-guest screens or when guest flow is disabled.
 * 3. Redirects back to the template page when the journey has no customisable content.
 */
export function useTemplateCustomizationRedirect({
  journeyId,
  screens,
  activeScreen,
  isGuest,
  guestFlowEnabled,
  hasAnyContent
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

  // 2. For guests: redirect if guest flow is disabled for this template
  useEffect(() => {
    if (!router.isReady || !journeyId || !isGuest) return
    if (guestFlowEnabled) return

    enqueueSnackbar(t('This template cannot be customised by a guest.'), {
      variant: 'error',
      preventDuplicate: true
    })
    void router.replace(
      buildCustomizeUrl(journeyId, getFirstGuestAllowedScreen(), true)
    )
  }, [
    router,
    router.isReady,
    journeyId,
    isGuest,
    guestFlowEnabled,
    t,
    enqueueSnackbar
  ])

  // 3. For guests: redirect if current screen is not allowed
  useEffect(() => {
    if (!router.isReady || !journeyId || !isGuest || !guestFlowEnabled) return
    if (isScreenAllowedForGuest(activeScreen)) return

    enqueueSnackbar(
      t(
        "The step you're trying to access is not available to guests. Please sign up."
      ),
      { variant: 'error', preventDuplicate: true }
    )
    void router.replace(buildCustomizeUrl(journeyId, 'guestPreview', true))
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

  // 4. Redirect back to template page when journey has no customisable content.
  // journey.customizable (used by the gallery) is backend-computed and may be stale
  // or out of sync with what the step-level checks can resolve (e.g. templates
  // where journeyCustomizationDescription is set but journeyCustomizationFields is
  // empty, or where the customizableMedia flag is the only thing in scope but is
  // currently off). hasAnyContent is undefined while the journey is loading.
  useEffect(() => {
    if (!router.isReady || !journeyId || hasAnyContent !== false) return

    enqueueSnackbar(
      t(
        'This template has no customisable content. Redirecting to template page.'
      ),
      { variant: 'info', preventDuplicate: true }
    )
    void router.replace(`/templates/${journeyId}`)
  }, [router, router.isReady, journeyId, hasAnyContent, t, enqueueSnackbar])
}
