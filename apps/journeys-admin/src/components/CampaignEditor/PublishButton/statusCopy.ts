import { TFunction } from 'i18next'
/** The campaign's status copy (PRD #9657 §10), shared by the Publish popover and the campaign settings. */
export function campaignStatusCopy(t: TFunction, published: boolean): string {
  return published
    ? t(
        'Published. Edits are saved as you make them and reach the public page shortly.'
      )
    : t(
        'Draft. Edits are saved as you make them; nothing is public until you publish.'
      )
}
