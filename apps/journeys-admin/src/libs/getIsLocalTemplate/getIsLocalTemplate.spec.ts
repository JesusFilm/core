import { getIsLocalTemplate } from './getIsLocalTemplate'

describe('getIsLocalTemplate', () => {
  it('returns true for a template owned by a non-jfp team', () => {
    expect(
      getIsLocalTemplate({ template: true, team: { id: 'local-team-id' } })
    ).toBe(true)
  })

  it('returns false for a template owned by jfp-team (global)', () => {
    expect(
      getIsLocalTemplate({ template: true, team: { id: 'jfp-team' } })
    ).toBe(false)
  })

  it('returns false for a non-template journey', () => {
    expect(
      getIsLocalTemplate({ template: false, team: { id: 'local-team-id' } })
    ).toBe(false)
  })

  it('returns false when journey is null or undefined', () => {
    expect(getIsLocalTemplate(undefined)).toBe(false)
    expect(getIsLocalTemplate(null)).toBe(false)
  })

  it('treats a template with no team as local (matches the inline check at prior call sites)', () => {
    // Prior inline predicate `team?.id !== 'jfp-team'` returns true when team
    // is null/undefined; this helper preserves that behavior verbatim.
    expect(getIsLocalTemplate({ template: true, team: null })).toBe(true)
  })
})
