import {
  exampleJourneys,
  shortJourney,
  typicalJourney
} from '../journeySchema/examples'
import type { Journey } from '../journeySchema'

import { checkJourney } from './checkJourney'
import { youTubeId } from './youTubeId'

function clone(journey: Journey): Journey {
  return structuredClone(journey)
}

describe('checkJourney', () => {
  it('passes the example journeys', () => {
    exampleJourneys.forEach((journey) => {
      expect(checkJourney(journey).errors).toEqual([])
    })
  })

  it('flags a goTo that points at a missing step, listing the real ones', () => {
    const journey = clone(shortJourney)
    journey.steps[1].card.content[2] = {
      type: 'button',
      name: 'claims-next',
      label: 'Next',
      style: 'primary',
      action: { goTo: 'amen' }
    }

    expect(checkJourney(journey).errors).toEqual([
      "step `claims`, item `claims-next`: goTo `amen` doesn't exist. Use one of: welcome, claims, close."
    ])
  })

  it('flags a next that points at a missing step', () => {
    const journey = clone(shortJourney)
    journey.steps[0].next = 'nowhere'

    expect(checkJourney(journey).errors[0]).toContain(
      "next `nowhere` doesn't exist"
    )
  })

  it('flags names used twice anywhere in the journey', () => {
    const journey = clone(shortJourney)
    journey.steps[1].card.name = 'welcome-card'

    expect(checkJourney(journey).errors).toEqual([
      'step `claims`, card `welcome-card`: name `welcome-card` is used more than once. Names must be unique across the journey.'
    ])
  })

  it('flags a step with no way forward unless it is the last', () => {
    const journey = clone(shortJourney)
    journey.steps[1].card.content = journey.steps[1].card.content.slice(0, 2)

    expect(checkJourney(journey).errors).toEqual([
      'step `claims`: has no way forward. Add a button or poll, or set next.'
    ])
  })

  it('accepts next as a way forward', () => {
    const journey = clone(shortJourney)
    journey.steps[1].card.content = journey.steps[1].card.content.slice(0, 2)
    journey.steps[1].next = 'close'

    expect(checkJourney(journey).errors).toEqual([])
  })

  it('flags a video card that holds anything else', () => {
    const journey = clone(shortJourney)
    journey.steps[1].card.content.push({
      type: 'video',
      name: 'claims-video',
      url: 'https://youtu.be/dQw4w9WgXcQ'
    })

    expect(checkJourney(journey).errors).toEqual([
      'step `claims`: a card with a video must hold only the video. Move the other items to another step.'
    ])
  })

  it('flags a non-YouTube video and a start after the end', () => {
    const journey = clone(shortJourney)
    journey.steps[1].card.content = [
      {
        type: 'video',
        name: 'claims-video',
        url: 'https://vimeo.com/1234',
        startAt: 30,
        endAt: 10
      }
    ]

    expect(checkJourney(journey).errors).toEqual([
      'step `claims`, item `claims-video`: `https://vimeo.com/1234` is not a YouTube video link. Only YouTube videos are supported.',
      'step `claims`, item `claims-video`: startAt must be before endAt.'
    ])
  })

  it('flags a multiselect with no button after it on the card', () => {
    const journey = clone(typicalJourney)
    const topics = journey.steps[2].card
    const button = topics.content.find((item) => item.type === 'button')
    if (button == null) throw new Error('fixture changed')
    topics.content = [
      button,
      ...topics.content.filter((item) => item !== button)
    ]

    expect(checkJourney(journey).errors).toEqual([
      'step `topics`, item `topics-select`: a multiselect must be followed by a button on the same card.'
    ])
  })

  it('flags multiselect min above max', () => {
    const journey = clone(typicalJourney)
    const select = journey.steps[2].card.content[1]
    if (select.type !== 'multiselect') throw new Error('fixture changed')
    select.min = 3
    select.max = 2

    expect(checkJourney(journey).errors).toEqual([
      'step `topics`, item `topics-select`: min must not be more than max.'
    ])
  })

  it('flags multiselect max above the option count', () => {
    const journey = clone(typicalJourney)
    const select = journey.steps[2].card.content[1]
    if (select.type !== 'multiselect') throw new Error('fixture changed')
    select.max = 5

    expect(checkJourney(journey).errors).toEqual([
      'step `topics`, item `topics-select`: max is more than the number of options (4).'
    ])
  })

  it('flags a link that is not http(s)', () => {
    const journey = clone(shortJourney)
    journey.steps[2].card.content[1] = {
      type: 'button',
      name: 'close-link',
      label: 'Mail us',
      style: 'secondary',
      action: { url: 'mailto:hi@example.com' }
    }

    expect(checkJourney(journey).errors).toEqual([
      'step `close`, item `close-link`: url `mailto:hi@example.com` must start with http:// or https://.'
    ])
  })

  it('warns, without failing, about a step nothing links to', () => {
    const journey = clone(shortJourney)
    journey.steps[1].card.content[2] = {
      type: 'button',
      name: 'claims-next',
      label: 'Next',
      style: 'primary',
      action: { url: 'https://example.com' }
    }

    expect(checkJourney(journey)).toEqual({
      errors: [],
      warnings: ['step `close`: nothing links to it.']
    })
  })
})

describe('youTubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=10', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://vimeo.com/1234', null],
    ['not a url', null],
    ['https://www.youtube.com/watch?v=short', null]
  ])('reads %s', (url, id) => {
    expect(youTubeId(url)).toBe(id)
  })
})
