import { prismaMock } from '../../../test/prismaMock'

import { filterToTeamTemplates } from './filterToTeamTemplates'

describe('filterToTeamTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty result for empty input without querying', async () => {
    const result = await filterToTeamTemplates(prismaMock as any, 'team-1', [])
    expect(result).toEqual({ validIds: [], droppedCount: 0 })
    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
  })

  it('drops journeys not in the team', async () => {
    prismaMock.journey.findMany.mockResolvedValue([{ id: 'j1' }] as any)
    const result = await filterToTeamTemplates(prismaMock as any, 'team-1', [
      'j1',
      'j2-cross-team'
    ])
    expect(result).toEqual({ validIds: ['j1'], droppedCount: 1 })
  })

  it('preserves input ordering of valid IDs', async () => {
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'j1' },
      { id: 'j2' },
      { id: 'j3' }
    ] as any)
    const result = await filterToTeamTemplates(prismaMock as any, 'team-1', [
      'j3',
      'j1',
      'j2'
    ])
    expect(result.validIds).toEqual(['j3', 'j1', 'j2'])
  })

  it('deduplicates input before querying', async () => {
    prismaMock.journey.findMany.mockResolvedValue([{ id: 'j1' }] as any)
    const result = await filterToTeamTemplates(prismaMock as any, 'team-1', [
      'j1',
      'j1',
      'j1'
    ])
    expect(result.validIds).toEqual(['j1'])
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['j1'] }, teamId: 'team-1', template: true },
      select: { id: true }
    })
  })

  it('queries with template:true and the given teamId (cross-team isolation)', async () => {
    prismaMock.journey.findMany.mockResolvedValue([] as any)
    await filterToTeamTemplates(prismaMock as any, 'team-X', ['j1'])
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['j1'] }, teamId: 'team-X', template: true },
      select: { id: true }
    })
  })
})
