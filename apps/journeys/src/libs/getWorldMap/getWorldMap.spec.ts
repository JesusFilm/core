import { getWorldMap } from './getWorldMap'

describe('getWorldMap', () => {
  it('projects the public countries-110m.json into path strings', async () => {
    const worldMap = await getWorldMap()
    expect(worldMap.width).toBe(960)
    expect(worldMap.countries.length).toBeGreaterThan(150)
    expect(
      worldMap.countries.every((country) => country.d.startsWith('M'))
    ).toBe(true)
  })

  it('builds once per process', async () => {
    expect(await getWorldMap()).toBe(await getWorldMap())
  })

  it('survives a JSON round trip, as page props do', async () => {
    const worldMap = await getWorldMap()
    expect(JSON.parse(JSON.stringify(worldMap))).toEqual(worldMap)
  })
})
