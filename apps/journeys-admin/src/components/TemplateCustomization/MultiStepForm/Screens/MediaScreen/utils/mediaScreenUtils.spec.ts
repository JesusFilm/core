import type { TreeBlock } from '@core/journeys/ui/block'
import type { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'

import {
  getCardBlockIdFromStep,
  getCustomizableMediaSteps
} from './mediaScreenUtils'

describe('mediaScreenUtils', () => {
  describe('getCardBlockIdFromStep', () => {
    it('returns card block id when step has a card block child', () => {
      const step = {
        id: 'step1',
        __typename: 'StepBlock',
        children: [{ id: 'card1', __typename: 'CardBlock', children: [] }]
      } as unknown as TreeBlock<StepBlock>
      expect(getCardBlockIdFromStep(step)).toBe('card1')
    })

    it('returns null when step has no card block child', () => {
      const step = {
        id: 'step1',
        __typename: 'StepBlock',
        children: [{ id: 'other', __typename: 'OtherBlock', children: [] }]
      } as unknown as TreeBlock<StepBlock>
      expect(getCardBlockIdFromStep(step)).toBeNull()
    })

    it('returns null when step is undefined', () => {
      expect(getCardBlockIdFromStep(undefined)).toBeNull()
    })
  })

  describe('getCustomizableMediaSteps', () => {
    it('returns empty array when steps is empty', () => {
      expect(getCustomizableMediaSteps([], ['media1'])).toEqual([])
    })

    it('returns empty array when customizableMediaIds is empty', () => {
      const steps: TreeBlock<StepBlock>[] = [
        {
          id: 'step1',
          __typename: 'StepBlock',
          children: [{ id: 'media1', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>
      ]
      expect(getCustomizableMediaSteps(steps, [])).toEqual([])
    })

    it('returns only steps that contain a direct child with id in customizableMediaIds', () => {
      const steps: TreeBlock<StepBlock>[] = [
        {
          id: 'step1',
          __typename: 'StepBlock',
          children: [
            { id: 'target-media', __typename: 'CardBlock', children: [] }
          ]
        } as unknown as TreeBlock<StepBlock>,
        {
          id: 'step2',
          __typename: 'StepBlock',
          children: [{ id: 'other', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>
      ]
      const result = getCustomizableMediaSteps(steps, ['target-media'])
      expect(result).toEqual([steps[0]])
    })

    it('returns only steps that contain a nested descendant with id in customizableMediaIds', () => {
      const steps: TreeBlock<StepBlock>[] = [
        {
          id: 'step1',
          __typename: 'StepBlock',
          children: [
            {
              id: 'card1',
              __typename: 'CardBlock',
              children: [
                { id: 'nested-media', __typename: 'CardBlock', children: [] }
              ]
            }
          ]
        } as unknown as TreeBlock<StepBlock>,
        {
          id: 'step2',
          __typename: 'StepBlock',
          children: [{ id: 'card2', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>
      ]
      const result = getCustomizableMediaSteps(steps, ['nested-media'])
      expect(result).toEqual([steps[0]])
    })

    it('should return steps that contain direct children and nested descendants with id in customizableMediaIds', () => {
      const steps: TreeBlock<StepBlock>[] = [
        {
          id: 'step1',
          __typename: 'StepBlock',
          children: [
            {
              id: 'card1',
              __typename: 'CardBlock',
              children: [
                { id: 'nested-media', __typename: 'CardBlock', children: [] }
              ]
            }
          ]
        } as unknown as TreeBlock<StepBlock>,
        {
          id: 'step2',
          __typename: 'StepBlock',
          children: [{ id: 'card2', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>
      ]
      const result = getCustomizableMediaSteps(steps, ['nested-media', 'card2'])
      expect(result).toEqual(steps)
    })

    it('excludes steps that have no matching descendant', () => {
      const steps: TreeBlock<StepBlock>[] = [
        {
          id: 'step1',
          __typename: 'StepBlock',
          children: [{ id: 'block-a', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>,
        {
          id: 'step2',
          __typename: 'StepBlock',
          children: [{ id: 'block-b', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>
      ]
      expect(getCustomizableMediaSteps(steps, ['media-x'])).toEqual([])
    })

    it('preserves step order', () => {
      const steps: TreeBlock<StepBlock>[] = [
        {
          id: 'stepA',
          __typename: 'StepBlock',
          children: [{ id: 'media-a', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>,
        {
          id: 'stepB',
          __typename: 'StepBlock',
          children: [{ id: 'media-b', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>,
        {
          id: 'stepC',
          __typename: 'StepBlock',
          children: [{ id: 'other', __typename: 'CardBlock', children: [] }]
        } as unknown as TreeBlock<StepBlock>
      ]
      const result = getCustomizableMediaSteps(steps, ['media-a', 'media-b'])
      expect(result.map((s) => s.id)).toEqual(['stepA', 'stepB'])
    })
  })
})
