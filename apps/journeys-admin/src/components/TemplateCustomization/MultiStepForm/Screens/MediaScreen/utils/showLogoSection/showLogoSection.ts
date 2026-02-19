import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'

/**
 * Shows the logo section on the media screen.
 * Logo is journey-level; checks journey.logoImageBlock?.customizable.
 *
 * @param journey - The journey object
 * @returns true if the logo section should be shown, false otherwise
 */
export function showLogoSection(journey?: Journey): boolean {
  return journey?.logoImageBlock?.customizable === true
}
