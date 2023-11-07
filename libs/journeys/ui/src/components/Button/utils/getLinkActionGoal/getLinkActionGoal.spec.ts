import { GoalType, getLinkActionGoal } from './getLinkActionGoal'

describe('getLinkActionGoal', () => {
  it('should return Chat when url includes chat platform', () => {
    const url = 'https://m.me/some-id'
    const result = getLinkActionGoal(url)
    expect(result).toEqual(GoalType.Chat)
  })

  it('should return Bible when url includes bible platform', () => {
    const url = 'https://bible.com'
    const result = getLinkActionGoal(url)
    expect(result).toEqual(GoalType.Bible)
  })

  it('should return Website when url does not include chat or bible platform', () => {
    const url = 'https://example-website.com'
    const result = getLinkActionGoal(url)
    expect(result).toEqual(GoalType.Website)
  })
})
