import { ReactFlowStore } from 'reactflow'

import { ARROW_OFFSET, ORIGINAL_TOOLTIP_MARGIN } from '../constants'

// Calculates the tooltip offset to work with react flow zoom
export const getReactflowTooltipOffset = (store: ReactFlowStore): number => {
  const zoom = store.transform[2]

  // (react flow zoom min/max, tooltip offset to match zoom) used to calculate slope-intercept:
  // (0.5, -4)
  // (2.0, 5)
  const slope = 6 * zoom - 7

  // Needed to 're-add' the original tooltip placement margin so the tooltip placement will scale correctly
  return slope + ORIGINAL_TOOLTIP_MARGIN - ARROW_OFFSET
}
