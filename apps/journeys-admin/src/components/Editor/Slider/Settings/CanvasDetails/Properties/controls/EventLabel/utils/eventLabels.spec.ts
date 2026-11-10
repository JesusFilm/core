import { TFunction } from 'next-i18next/pages'

import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockEventLabel } from '../../../../../../../../../../__generated__/globalTypes'

import { eventLabelOptions } from './eventLabels'
import { getCurrentEventLabel } from './getCurrentEventLabel'
import { getEventLabelOption } from './getEventLabelOption'
import { getFilteredEventLabels } from './getFilteredEventLabels'

describe('custom tracking label options', () => {
  const translate = vi.fn((key: string) => `translated ${key}`)
  const t = translate as unknown as TFunction
  const labels = {
    custom1Label: '<strong>{{count}} 😀</strong>',
    custom2Label: 'Prayer follow-up',
    custom3Label: 'Registered'
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('uses stored names without passing them through translation', () => {
    const options = eventLabelOptions(t, labels)

    expect(options.filter(({ type }) => type.startsWith('custom'))).toEqual([
      { type: BlockEventLabel.custom1, label: labels.custom1Label },
      { type: BlockEventLabel.custom2, label: labels.custom2Label },
      { type: BlockEventLabel.custom3, label: labels.custom3Label }
    ])
    for (const label of Object.values(labels)) {
      expect(translate).not.toHaveBeenCalledWith(label)
    }
  })

  it('uses translated defaults for null or omitted definitions', () => {
    const options = eventLabelOptions(t, { custom1Label: null })

    expect(options.filter(({ type }) => type.startsWith('custom'))).toEqual([
      { type: BlockEventLabel.custom1, label: 'translated Custom Tracking 1' },
      { type: BlockEventLabel.custom2, label: 'translated Custom Tracking 2' },
      { type: BlockEventLabel.custom3, label: 'translated Custom Tracking 3' }
    ])
  })

  it('keeps template definitions independent', () => {
    expect(getEventLabelOption(t, BlockEventLabel.custom1, labels).label).toBe(
      labels.custom1Label
    )
    expect(
      getEventLabelOption(t, BlockEventLabel.custom1, {
        custom1Label: 'Another template'
      }).label
    ).toBe('Another template')
    expect(getEventLabelOption(t, BlockEventLabel.custom1).label).toBe(
      'translated Custom Tracking 1'
    )
  })

  it.each<{
    blockType: string
    videoActionType?: 'start' | 'complete'
    eventLabel: BlockEventLabel
    expectedLabel: string
  }>([
    {
      blockType: 'CardBlock',
      eventLabel: BlockEventLabel.custom1,
      expectedLabel: labels.custom1Label
    },
    {
      blockType: 'ButtonBlock',
      eventLabel: BlockEventLabel.custom2,
      expectedLabel: labels.custom2Label
    },
    {
      blockType: 'RadioOptionBlock',
      eventLabel: BlockEventLabel.custom3,
      expectedLabel: labels.custom3Label
    },
    {
      blockType: 'VideoBlock',
      videoActionType: 'start',
      eventLabel: BlockEventLabel.custom1,
      expectedLabel: labels.custom1Label
    },
    {
      blockType: 'VideoBlock',
      videoActionType: 'complete',
      eventLabel: BlockEventLabel.custom2,
      expectedLabel: labels.custom2Label
    }
  ])(
    'renames $blockType $videoActionType selection without changing allowed event types',
    ({ blockType, videoActionType, eventLabel, expectedLabel }) => {
      const block = {
        __typename: blockType,
        eventLabel:
          videoActionType === 'complete' ? BlockEventLabel.custom3 : eventLabel,
        endEventLabel: eventLabel,
        children: []
      } as unknown as TreeBlock

      const current = getCurrentEventLabel(t, block, videoActionType, labels)
      expect(current).toEqual({ type: eventLabel, label: expectedLabel })

      const options = getFilteredEventLabels(t, block, videoActionType, labels)
      expect(options.map(({ type }) => type)).toEqual(
        getFilteredEventLabels(t, block, videoActionType).map(
          ({ type }) => type
        )
      )
      expect(options).toContainEqual(current)
      expect(getEventLabelOption(t, current.type, labels)).toEqual(current)
    }
  )
})
