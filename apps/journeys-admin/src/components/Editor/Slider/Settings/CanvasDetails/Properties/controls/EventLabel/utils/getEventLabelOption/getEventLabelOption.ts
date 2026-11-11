import { TFunction } from 'next-i18next/pages'

import type {
  CustomTrackingLabels,
  EventLabelOption,
  EventLabelType
} from '../eventLabels'
import { eventLabelOptions } from '../eventLabels'

export function getEventLabelOption(
  t: TFunction,
  type?: EventLabelType | null,
  labels?: CustomTrackingLabels | null
): EventLabelOption {
  const options = eventLabelOptions(t, labels)
  if (type == null) return options[0]

  return options.find((option) => option.type === type) ?? options[0]
}
