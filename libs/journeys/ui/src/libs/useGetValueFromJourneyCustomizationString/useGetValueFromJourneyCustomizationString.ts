import { useMemo } from 'react'

import { useJourney } from '../JourneyProvider'
import { resolveJourneyCustomizationString } from '../resolveJourneyCustomizationString'

/**
 * Returns a memoized label string resolved from a potential customization template
 * using the current Journey context. If variant is 'admin', returns the label as-is.
 * Otherwise resolves strictly matching patterns like `{{ key }}` or `{{ key: value }}`
 * against `journey.journeyCustomizationFields`.
 */
export function useGetValueFromJourneyCustomizationString(
  label: string | null | undefined
): string {
  const { journey, variant } = useJourney()

  return useMemo(() => {
    const input = label ?? ''
    if (variant === 'admin' && journey?.template) return input
    return (
      resolveJourneyCustomizationString(
        input,
        journey?.journeyCustomizationFields ?? []
      ) ?? ''
    )
  }, [label, variant, journey?.journeyCustomizationFields, journey?.template])
}
