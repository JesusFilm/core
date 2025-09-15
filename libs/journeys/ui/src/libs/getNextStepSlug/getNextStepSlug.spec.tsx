import { ActionFields as Action } from '../action/__generated__/ActionFields'
import {
  JourneyFields as Journey,
  JourneyFields_blocks_StepBlock as StepBlock
} from '../JourneyProvider/__generated__/JourneyFields'

import { getNextStepSlug } from './getNextStepSlug'

describe('getNextStepSlug', () => {
  const defaultJourney = {
    id: 'journeyId',
    __typename: 'Journey',
    slug: 'journey-slug',
    website: null,
    blocks: []
  } as unknown as Journey

  const defaultBlock = {
    __typename: 'StepBlock',
    id: 'stepId',
    slug: 'step-slug'
  } as unknown as StepBlock

  const defaultAction: Action = {
    __typename: 'NavigateToBlockAction',
    parentBlockId: 'parentBlockId',
    gtmEventName: null,
    blockId: 'stepId'
  }

  it('should return the slug to the next step for step id', () => {
    const block = {
      ...defaultBlock,
      slug: null
    }
    const journey = {
      ...defaultJourney,
      website: true,
      blocks: [block]
    }

    const result = getNextStepSlug(journey, defaultAction)

    expect(result).toBe(`/${journey.slug}/${defaultBlock.id}`)
  })

  it('should return the slug to the next step for step slug', () => {
    const journey = {
      ...defaultJourney,
      website: true,
      blocks: [defaultBlock]
    }

    const result = getNextStepSlug(journey, defaultAction)

    expect(result).toBe(`/${journey.slug}/${defaultBlock.slug}`)
  })

  it('should return undefined if journey is not a website', () => {
    const result = getNextStepSlug(defaultJourney, defaultAction)

    expect(result).toBeUndefined()
  })

  it('should return undefined if action is not NavigateToBlock action', () => {
    const action: Action = {
      __typename: 'LinkAction',
      parentBlockId: 'parentBlockId',
      gtmEventName: null,
      url: 'url',
      customizable: null,
      parentStepId: null
    }
    const result = getNextStepSlug(defaultJourney, action)

    expect(result).toBeUndefined()
  })

  it('should return undefined if block is not a valid next step', () => {
    const block = {
      ...defaultBlock,
      __typename: 'ButtonBlock'
    }

    const journey = {
      ...defaultJourney,
      website: true,
      blocks: [block]
    } as unknown as Journey

    const result = getNextStepSlug(journey, defaultAction)

    expect(result).toBeUndefined()
  })
})
