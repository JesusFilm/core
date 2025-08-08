import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

export function getTemplateCustomizationFields(journey?: Journey): string[] {
  const templateStrings = new Set<string>()
  if (journey == null) return []

  // Helper function to extract template strings from text
  const extractTemplateStrings = (text: string | null | undefined): void => {
    if (text == null || text === '') return
    const regex = /\{\{\s*([^}]+?)\s*\}\}/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      const keyName = match[1].trim()
      if (keyName !== '') templateStrings.add(keyName)
    }
  }

  // Extract from journey-level text fields
  extractTemplateStrings(journey.title)
  extractTemplateStrings(journey.description)
  extractTemplateStrings(journey.seoTitle)
  extractTemplateStrings(journey.seoDescription)
  extractTemplateStrings(journey.creatorDescription)
  extractTemplateStrings(journey.displayTitle)
  extractTemplateStrings(journey.slug)
  extractTemplateStrings(journey.strategySlug)

  // Extract from user journeys
  if (journey.userJourneys) {
    journey.userJourneys.forEach((userJourney) => {
      if (userJourney.user) {
        extractTemplateStrings(userJourney.user.firstName)
        extractTemplateStrings(userJourney.user.lastName)
        extractTemplateStrings(userJourney.user.imageUrl)
      }
    })
  }

  // Flatten and extract from blocks
  if (journey.blocks) {
    journey.blocks.forEach((block) => {
      switch (block.__typename) {
        case 'TypographyBlock':
          extractTemplateStrings(block.content)
          break
        case 'ButtonBlock':
          extractTemplateStrings(block.label)
          break
        case 'TextResponseBlock':
          extractTemplateStrings(block.label)
          extractTemplateStrings(block.placeholder)
          extractTemplateStrings(block.hint)
          break
        case 'RadioOptionBlock':
          extractTemplateStrings(block.label)
          break
        case 'SignUpBlock':
          extractTemplateStrings(block.submitLabel)
          break
        case 'IconBlock':
          extractTemplateStrings(block.iconName)
          break
        default:
          break
      }
    })
  }

  return Array.from(templateStrings)
}
