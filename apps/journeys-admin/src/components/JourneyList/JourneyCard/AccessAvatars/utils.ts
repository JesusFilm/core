import { GetJourneys_journeys_userJourneys_user } from '../../../../../__generated__/GetJourneys'

export function createToolTipTitle(
  user: GetJourneys_journeys_userJourneys_user
): string {
  if (user.firstName != null && user.lastName != null) {
    return `${user.firstName} ${user.lastName}`
  } else if (user.email != null) {
    return `${user.email}`
  } else {
    return 'Anonymous'
  }
}

export function createFallbackLetter(
  user: GetJourneys_journeys_userJourneys_user
): string | null {
  if (user.firstName != null) {
    return `${user.firstName[0].toUpperCase()}`
  } else if (user.email != null) {
    return `${user.email[0].toUpperCase()}`
  } else {
    return null
  }
}
