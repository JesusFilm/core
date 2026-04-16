import { useMemo } from 'react'

import { useJourney } from '../JourneyProvider'
import { resolveJourneyCustomizationString } from '../resolveJourneyCustomizationString'

/**
 * Returns a memoized label string resolved from a potential customization template
 * using the current Journey context. If variant is 'admin' and the journey is a
 * template, returns the label as-is (raw tokens). Otherwise resolves using
 * value first, falling back to defaultValue.
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
  }, [label, variant, journey?.journeyCustomizationFields])
}
