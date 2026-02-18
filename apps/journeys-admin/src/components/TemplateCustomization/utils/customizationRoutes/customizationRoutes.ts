import type { CustomizationScreen } from '../getCustomizeFlowConfig'

export const CUSTOMIZE_SCREEN_QUERY_KEY = 'screen'

/**
 * Screens that a guest user (not signed in) can access when templateCustomizationGuestFlow is on.
 * For now: language, text, and links only.
 */
export const GUEST_ACCESSIBLE_SCREENS: readonly CustomizationScreen[] = [
  'language',
  'text',
  'links'
] as const

export type GuestAccessibleScreen = (typeof GUEST_ACCESSIBLE_SCREENS)[number]

export function isScreenAllowedForGuest(
  screen: CustomizationScreen
): screen is GuestAccessibleScreen {
  return (GUEST_ACCESSIBLE_SCREENS as readonly string[]).includes(screen)
}

/** First screen in the flow that guests are allowed to access. */
export function getFirstGuestAllowedScreen(): CustomizationScreen {
  return GUEST_ACCESSIBLE_SCREENS[0]
}

/**
 * Parses the screen query param to a single string value (or undefined).
 * Does not validate against a screens list; use getActiveScreenFromQuery for that.
 */
export function parseScreenFromQuery(
  queryValue: string | string[] | undefined | null
): string | undefined {
  if (queryValue == null) return undefined
  const raw = Array.isArray(queryValue) ? queryValue[0] : queryValue
  return raw === '' ? undefined : raw
}

/**
 * Optional callback invoked when the returned URL is `/templates` because journeyId was null/undefined.
 * Use this to show an error snackbar or other feedback before redirecting.
 */
export type OnTemplatesRedirectCallback = () => void

/**
 * Builds the customize page URL with optional screen query.
 * If journeyId is null/undefined, calls onTemplatesRedirect (if provided) and returns `/templates`.
 * When isGuest is true, never outputs a URL for a non-guest-accessible screen.
 */
export function buildCustomizeUrl(
  journeyId: string | null | undefined,
  screen: CustomizationScreen,
  isGuest?: boolean,
  onTemplatesRedirect?: OnTemplatesRedirectCallback
): string {
  if (journeyId == null) {
    onTemplatesRedirect?.()
    return '/templates'
  }

  const effectiveScreen =
    isGuest && !isScreenAllowedForGuest(screen)
      ? getFirstGuestAllowedScreen()
      : screen

  const base = `/templates/${journeyId}/customize`
  const params = new URLSearchParams({
    [CUSTOMIZE_SCREEN_QUERY_KEY]: effectiveScreen
  })
  return `${base}?${params.toString()}`
}

/**
 * Resolves the active screen from the router query.
 * If the query value is a valid screen in the given list, returns it; otherwise returns the first screen.
 */
export function getActiveScreenFromQuery(
  queryValue: string | string[] | undefined,
  screens: CustomizationScreen[]
): CustomizationScreen {
  const raw = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (raw != null && screens.includes(raw as CustomizationScreen)) {
    return raw as CustomizationScreen
  }
  return screens[0]
}
