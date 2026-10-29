/**
 * The DOM id of a region card on the canvas, and its Navigator row's id: a
 * region can show in more than one Region Switcher, so the card is keyed by
 * the switcher it sits in.
 */
export function regionCardId(hostBlockId: string, regionId: string): string {
  return `${hostBlockId}__${regionId}`
}
