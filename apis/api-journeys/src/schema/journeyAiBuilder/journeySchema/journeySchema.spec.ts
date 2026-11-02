import { z } from 'zod'

import { exampleJourneys, shortJourney } from './examples'
import {
  journeyForModel,
  journeyInputSchema,
  journeySchema
} from './journeySchema'

describe('journeySchema', () => {
  it('accepts the three example journeys', () => {
    exampleJourneys.forEach((journey) => {
      expect(journeySchema.safeParse(journey).success).toBe(true)
      expect(journeyInputSchema.safeParse(journey).success).toBe(true)
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

  it('converts to a JSON Schema for the gateway without the photo fields', () => {
    const jsonSchema = z.toJSONSchema(journeyInputSchema, { io: 'input' })

    expect(jsonSchema).toHaveProperty('properties.steps')
    expect(JSON.stringify(jsonSchema)).not.toContain('"src"')
    expect(JSON.stringify(jsonSchema)).not.toContain('"blurhash"')
  })

  it('keeps the photo fields away from the model', () => {
    const stored = structuredClone(shortJourney)
    stored.steps[0].card.backgroundImage = {
      search: 'sunrise over hills',
      alt: 'Sunrise',
      src: 'https://images.unsplash.com/1',
      width: 100,
      height: 200,
      blurhash: 'hash1'
    }

    expect(journeyForModel(stored).steps[0].card.backgroundImage).toEqual({
      search: 'sunrise over hills',
      alt: 'Sunrise'
    })
    const written = journeyInputSchema.parse(stored)
    expect(written.steps[0].card.backgroundImage).toEqual({
      search: 'sunrise over hills',
      alt: 'Sunrise'
    })
  })
})
