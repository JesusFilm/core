import { TFunction } from 'i18next'

import { characterCount } from './characterCount'

describe('characterCount', () => {
  it('reads the length and the cap through the counter key', () => {
    const t = vi.fn(
      (key: string, options: { length: number; max: number }) =>
        `${key}|${options.length}|${options.max}`
    ) as unknown as TFunction

    expect(characterCount(t, 12, 80)).toBe('{{length}} / {{max}}|12|80')
    expect(t).toHaveBeenCalledWith('{{length}} / {{max}}', {
      length: 12,
      max: 80
    })
  })
})
