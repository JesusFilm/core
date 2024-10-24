import clamp from 'lodash/clamp'

import { Position } from '../../FocalPoint'

const MIN_VALUE = 0
const MAX_VALUE = 100
const ROUND_PRECISION = 100

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
