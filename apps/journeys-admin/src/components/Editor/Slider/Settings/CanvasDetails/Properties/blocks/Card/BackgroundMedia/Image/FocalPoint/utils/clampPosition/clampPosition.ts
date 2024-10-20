import clamp from 'lodash/clamp'

import {
  MAX_VALUE,
  MIN_VALUE,
  Position,
  ROUND_PRECISION
} from '../../FocalPoint'

export function clampPosition(point: Position): Position {
  return {
    x:
      Math.round(clamp(point.x, MIN_VALUE, MAX_VALUE) * ROUND_PRECISION) /
      ROUND_PRECISION,
    y:
      Math.round(clamp(point.y, MIN_VALUE, MAX_VALUE) * ROUND_PRECISION) /
      ROUND_PRECISION
  }
}
