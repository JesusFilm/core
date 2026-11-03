import { shortJourney } from '../journeySchema/examples'
import type { Plan } from '../stages/stageSchemas'

import { checkPlanScope, checkStepStructure } from './planScope'

const plan: Extract<Plan, { kind: 'edit' }> = {
  kind: 'edit',
  changes: [
    { op: 'update', step: 'welcome', name: 'welcome-card', detail: 'Use fill.' }
  ],
  keep: ['claims', 'close'],
  assumptions: []
}

describe('planned step structure', () => {
  it('rejects removing or reordering existing cards during an appearance edit', () => {
    const after = structuredClone(shortJourney)
    after.steps = [after.steps[2], after.steps[0]]
    expect(checkStepStructure(shortJourney, after, plan)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Missing planned step `claims`'),
        expect.stringContaining('reordered without a planned move')
      ])
    )
  })

  it('allows adding a block to an existing card without authorizing new cards', () => {
    expect(
      checkPlanScope(
        {
          ...plan,
          changes: [
            {
              op: 'add',
              step: 'welcome',
              name: 'welcome-button',
              detail: 'Add a button to this card.'
            }
          ]
        },
        shortJourney
      )
    ).toEqual([])
  })

  it('accepts explicitly requested and planned card additions, removals and moves', () => {
    const after = structuredClone(shortJourney)
    after.steps = [
      after.steps[2],
      after.steps[0],
      { ...after.steps[1], name: 'new-step' }
    ]
    const structural: Extract<Plan, { kind: 'edit' }> = {
      ...plan,
      allowStepChanges: true,
      changes: [
        {
          op: 'add',
          step: 'new-step',
          name: 'new-step',
          detail: 'Add a new final card.'
        },
        {
          op: 'remove',
          step: 'claims',
          name: 'claims',
          detail: 'Remove claims.'
        },
        {
          op: 'move',
          step: 'close',
          name: 'close',
          detail: 'Move close first.'
        }
      ]
    }
    expect(checkPlanScope(structural, shortJourney)).toEqual([])
    expect(checkStepStructure(shortJourney, after, structural)).toEqual([])
  })

  it('rejects extra cards even when a different structural change was authorized', () => {
    const after = structuredClone(shortJourney)
    after.steps.push({ ...after.steps[0], name: 'unrequested' })
    expect(
      checkStepStructure(shortJourney, after, {
        ...plan,
        allowStepChanges: true
      })
    ).toEqual([expect.stringContaining('Unplanned new step `unrequested`')])
  })
})
