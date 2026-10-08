import { z } from 'zod'

import { exampleJourneys, shortJourney } from './examples'
import { journeySchema } from './journeySchema'

describe('journeySchema', () => {
  it('accepts the three example journeys', () => {
    exampleJourneys.forEach((journey) => {
      expect(journeySchema.safeParse(journey).success).toBe(true)
    })
  })

  it('rejects a name that is not lowercase-with-dashes', () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].name = 'Welcome Step'

    expect(journeySchema.safeParse(journey).success).toBe(false)
  })

  it('rejects an action with neither goTo nor url', () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].card.content[2] = {
      type: 'button',
      name: 'welcome-start',
      label: 'Start',
      style: 'primary',
      action: {} as never
    }

    expect(journeySchema.safeParse(journey).success).toBe(false)
  })

  it('rejects an unknown content type', () => {
    const journey = structuredClone(shortJourney) as unknown as {
      steps: Array<{ card: { content: unknown[] } }>
    }
    journey.steps[0].card.content.push({ type: 'signUp', name: 'sign-up' })

    expect(journeySchema.safeParse(journey).success).toBe(false)
  })

  it('converts to a JSON Schema for the gateway', () => {
    const jsonSchema = z.toJSONSchema(journeySchema, { io: 'input' })

    expect(jsonSchema).toHaveProperty('properties.steps')
  })
})
