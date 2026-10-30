import { renderHook, waitFor } from '@testing-library/react'

import type { WorldAtlasTopology } from '@core/journeys/ui/Campaign'

import type { useWorldMap as UseWorldMap } from './useWorldMap'

const atlas: WorldAtlasTopology = {
  type: 'Topology',
  objects: {
    countries: {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Polygon',
          id: '250',
          properties: { name: 'France' },
          arcs: [[0]]
        }
      ]
    }
  },
  arcs: [
    [
      [0, 40],
      [0, 50],
      [10, 50],
      [10, 40],
      [0, 40]
    ]
  ]
}

describe('useWorldMap', () => {
  const fetchMock = vi.fn()
  let useWorldMap: typeof UseWorldMap

  beforeEach(async () => {
    vi.resetModules()
    ;({ useWorldMap } = await import(
      /* webpackChunkName: "test-useWorldMap" */ './useWorldMap'
    ))
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => atlas
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('neither fetches nor reports anything while disabled', () => {
    const { result } = renderHook(() => useWorldMap(false))

    expect(result.current).toEqual({ shapes: null, error: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns no shapes until the atlas has loaded', () => {
    fetchMock.mockReturnValue(new Promise(() => undefined))
    const { result } = renderHook(() => useWorldMap(true))

    expect(result.current).toEqual({ shapes: null, error: null })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/countries-110m\.json$/)
    )
  })

  it('projects the fetched atlas into map shapes', async () => {
    const { result } = renderHook(() => useWorldMap(true))

    await waitFor(() => expect(result.current.shapes).not.toBeNull())
    expect(result.current.error).toBeNull()
    expect(result.current.shapes?.width).toBe(960)
    expect(result.current.shapes?.countries).toEqual([
      expect.objectContaining({
        id: '250',
        name: 'France',
        d: expect.stringMatching(/^M/)
      })
    ])
  })

  it('starts loading once enabled', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useWorldMap(enabled),
      { initialProps: { enabled: false } }
    )
    expect(fetchMock).not.toHaveBeenCalled()

    rerender({ enabled: true })

    await waitFor(() => expect(result.current.shapes).not.toBeNull())
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('fetches the atlas once per page load', async () => {
    const first = renderHook(() => useWorldMap(true))
    await waitFor(() => expect(first.result.current.shapes).not.toBeNull())

    const second = renderHook(() => useWorldMap(true))
    await waitFor(() => expect(second.result.current.shapes).not.toBeNull())

    expect(second.result.current.shapes).toBe(first.result.current.shapes)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reports the status when the atlas cannot be fetched', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 })
    const { result } = renderHook(() => useWorldMap(true))

    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.error?.message).toBe('world map 404')
    expect(result.current.shapes).toBeNull()
  })

  it('wraps a non-Error failure in an Error', async () => {
    fetchMock.mockRejectedValue('offline')
    const { result } = renderHook(() => useWorldMap(true))

    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('offline')
  })

  it('fetches again after a failure', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 })
    const failed = renderHook(() => useWorldMap(true))
    await waitFor(() => expect(failed.result.current.error).not.toBeNull())

    const retried = renderHook(() => useWorldMap(true))

    await waitFor(() => expect(retried.result.current.shapes).not.toBeNull())
    expect(retried.result.current.error).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
