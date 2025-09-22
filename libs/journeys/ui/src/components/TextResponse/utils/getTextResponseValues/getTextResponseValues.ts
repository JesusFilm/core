import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyProviderContext } from '../../../../libs/JourneyProvider/JourneyProvider'
import { resolveJourneyCustomizationString } from '../../../../libs/resolveJourneyCustomizationString'

export interface TextResponseStrings {
  label: string
  placeholder: string | null
  hint: string | null
}

export function getTextResponseValues(
  textResponseStrings: TextResponseStrings,
  journeyCustomizationFields: JourneyCustomizationField[],
  variant: JourneyProviderContext['variant'],
  journeyIsTemplate?: boolean | null | undefined
): TextResponseStrings {
  if (variant === 'admin' && journeyIsTemplate) {
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
