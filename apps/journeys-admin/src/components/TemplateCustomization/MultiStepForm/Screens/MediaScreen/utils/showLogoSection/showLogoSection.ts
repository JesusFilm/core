import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'

/**
 * Shows the logo section on the media screen.
 * Logo only renders at runtime when journey.website is true, so we gate
 * the customization UI on the same condition.
 *
 * @param journey - The journey object
 * @returns true if the logo section should be shown, false otherwise
 */
export function showLogoSection(journey?: Journey): boolean {
  return (
    journey?.website === true &&
    journey?.logoImageBlock?.customizable === true
  )
}
