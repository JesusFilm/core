import { resolve } from 'path'

import { getWorldMap } from './getWorldMap'

// Next serves the app from its own directory; nx runs the specs from the repo root.
const appRoot = resolve(__dirname, '../../..')

describe('getWorldMap', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(appRoot)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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
