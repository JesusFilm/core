import type { EventLabelOption } from '../eventLabels'
import { eventLabelOptions } from '../eventLabels'

export function getEventLabelOption(value: string): EventLabelOption {
  return eventLabelOptions.find((option) => option.type === value) ?? eventLabelOptions[0]
}
