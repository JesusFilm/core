import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { resolveJourneyCustomizationString } from '../../../../libs/resolveJourneyCustomizationString'

export type TextResponseVariant = 'default' | 'admin' | 'embed'

export interface TextResponseStrings {
  label: string
  placeholder: string | null
  hint: string | null
}

export function getTextResponseValues(
  textResponseStrings: TextResponseStrings,
  journeyCustomizationFields: JourneyCustomizationField[],
  variant: TextResponseVariant
): TextResponseStrings {
  if (variant === 'admin') {
    return textResponseStrings
  }

  return {
    label:
      resolveJourneyCustomizationString(
        textResponseStrings.label,
        journeyCustomizationFields
      ) ?? '',
    placeholder: resolveJourneyCustomizationString(
      textResponseStrings.placeholder,
      journeyCustomizationFields
    ),
    hint: resolveJourneyCustomizationString(
      textResponseStrings.hint,
      journeyCustomizationFields
    )
  }
}
