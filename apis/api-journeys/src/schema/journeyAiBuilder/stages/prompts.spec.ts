import { vi } from 'vitest'

import { BUILDER_INSTRUCTIONS } from './prompts'

vi.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: (text: string) => `«${text}»`,
  preSystemPrompt: 'pre'
}))

describe('BUILDER_INSTRUCTIONS', () => {
  // The gateway holds output to the schema's key order. An example with a
  // different order made Qwen write fullscreen first and then drop
  // backgroundImage, which the schema no longer allowed after it.
  it('shows the example card keys in schema order', () => {
    const example = BUILDER_INSTRUCTIONS.slice(
      BUILDER_INSTRUCTIONS.indexOf('{"title"')
    )

    expect(example.indexOf('"backgroundImage"')).toBeGreaterThan(-1)
    expect(example.indexOf('"backgroundImage"')).toBeLessThan(
      example.indexOf('"fullscreen"')
    )
  })
})
