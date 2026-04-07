import { useMemo } from 'react'

import { useJourney } from '../JourneyProvider'
import { resolveJourneyCustomizationString } from '../resolveJourneyCustomizationString'

/**
 * Returns a memoized label string resolved from a potential customization template
 * using the current Journey context. If variant is 'admin', returns the label as-is
 * for templates. For end-user variants ('default', 'embed'), resolves using
 * defaultValue (journey content language) first. For admin non-template views,
 * resolves using value (admin locale) first.
 */
export function useGetValueFromJourneyCustomizationString(
  label: string | null | undefined
): string {
  const { journey, variant } = useJourney()

  return useMemo(() => {
    const input = label ?? ''
    if (variant === 'admin' && journey?.template) return input
    const useDefaultValue = variant !== 'admin'
    return (
      resolveJourneyCustomizationString(
        input,
        journey?.journeyCustomizationFields ?? [],
        { useDefaultValue }
      ) ?? ''
    )
  }, [label, variant, journey?.journeyCustomizationFields])
}
