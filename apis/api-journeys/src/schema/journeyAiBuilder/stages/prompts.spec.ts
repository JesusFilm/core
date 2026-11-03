import { vi } from 'vitest'

import { BUILDER_INSTRUCTIONS, builderPrompt } from './prompts'

vi.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: (text: string) => `«${text}»`,
  preSystemPrompt: 'pre'
}))

describe('BUILDER_INSTRUCTIONS', () => {
  it('retains exact requested options when the confirmed plan abbreviates them', () => {
    const prompt = builderPrompt(
      {
        summary: '',
        journey: null,
        pendingPlan: null,
        messages: [
          {
            role: 'user',
            content:
              'Use Inter headings, Nunito body and a small outlined secondary button with #AADDFF text.'
          }
        ]
      },
      {
        kind: 'create',
        title: 'Test',
        steps: [
          {
            name: 'welcome',
            purpose: 'Styled welcome',
            content: ['text', 'button'],
            links: []
          }
        ],
        assumptions: []
      }
    )
    expect(prompt).toContain('Inter headings')
    expect(prompt).toContain('#AADDFF')
    expect(prompt).toContain('small outlined secondary button')
  })

  // The gateway holds output to the schema's key order. An example with a
  // different order made Qwen write fullscreen first and then drop
  // backgroundImage, which the schema no longer allowed after it.
  it('shows the example card keys in schema order', () => {
    const example = BUILDER_INSTRUCTIONS.slice(
      BUILDER_INSTRUCTIONS.indexOf('Example of a valid journey')
    )

    expect(example.indexOf('"backgroundImage"')).toBeGreaterThan(-1)
    expect(example.indexOf('"backgroundImage"')).toBeLessThan(
      example.indexOf('"fullscreen"')
    )
  })
})
