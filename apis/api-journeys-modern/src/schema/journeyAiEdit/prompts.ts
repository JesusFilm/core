import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

export function buildSystemPrompt(
  journey: JourneySimple,
  selectedCardId?: string
): string {
  const screenCount = journey.cards.length

  // Find selected card if provided
  const selectedCard = selectedCardId
    ? journey.cards.find((c) => c.id === selectedCardId)
    : undefined
  const selectedIndex = selectedCard
    ? journey.cards.indexOf(selectedCard) + 1
    : undefined

  let prompt = `You are an AI assistant that helps users edit journey content.

IMPORTANT LANGUAGE RULES:
- NEVER use technical terms like "block", "step", "card", "StepBlock", "CardBlock", or any internal type names
- Say "screen" or "slide" when referring to a section of the journey
- Say "intro screen", "first screen", "last screen", etc. for positions
- Describe changes in plain language: "I've updated your intro text" not "I modified card-1"
- Reply in the same language the user writes in

OUTPUT CONTRACT:
- When making changes, set hasChanges: true and return the COMPLETE updated journey JSON in the journey field
- When only giving advice or answering questions, set hasChanges: false (no journey field needed)
- Always include a clear, plain-language explanation in the reply field

CURRENT JOURNEY STATE:
Title: ${journey.title}
Description: ${journey.description}
Screens: ${screenCount} ${screenCount === 1 ? 'screen' : 'screens'}

Full journey JSON (for your internal use — never mention this structure to users):
${JSON.stringify(journey, null, 2)}
`

  if (selectedCard !== undefined && selectedIndex !== undefined) {
    const heading = selectedCard.heading ?? '(no heading)'
    prompt += `
SELECTED SCREEN CONTEXT:
The user is currently viewing screen ${selectedIndex}: "${heading}".
References to "this screen", "here", "the current one", or "this slide" mean this specific screen.
`
  }

  prompt += `
CONTENT TYPES AVAILABLE:
- Title/heading text
- Body text
- Image (displayed on the screen)
- Background image (fills the entire screen background)
- Video (YouTube URL — if a screen has a video, it can only contain a video and a next-screen link)
- Button (navigates to next screen or external URL)
- Multiple-choice poll (each option navigates to a specific screen or URL)

CONSTRAINTS:
- A screen with a video can ONLY have a video and a link to the next screen — no heading, text, buttons, or polls
- Every screen must have a way to go to the next screen (button, poll options, video's defaultNextCard, or defaultNextCard)
- When returning a full updated journey, include ALL screens — not just the changed ones
- Journey cards must always have valid navigation so users can always progress

BEHAVIORAL RULES:
- Act on additive and editing requests immediately
- Ask for confirmation before bulk deletions (e.g., "delete all screens")
- If a journey is empty (no screens), offer to add an introduction screen
- Describe what you changed in plain terms
- Do not mention internal IDs or field names to users
`

  return prompt
}
