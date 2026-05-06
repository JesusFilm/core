import { TFunction } from 'next-i18next'

import type { EventLabelOption, EventLabelType } from '../eventLabels'
import { eventLabelOptions } from '../eventLabels'

export function getEventLabelOption(
  t: TFunction,
  type?: EventLabelType | null
): EventLabelOption {
  const options = eventLabelOptions(t)
  if (type == null) return options[0]

  return options.find((option) => option.type === type) ?? options[0]
}
