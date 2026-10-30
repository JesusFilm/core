import { readFileSync } from 'fs'
import { resolve } from 'path'

import { renderHook, waitFor } from '@testing-library/react'

import type { WorldAtlasTopology } from './buildWorldMap'
import { useWorldMap } from './useWorldMap'

const atlas = JSON.parse(
  readFileSync(
    resolve(
      __dirname,
      '../../../../../../../../apps/journeys/public/countries-110m.json'
    ),
    'utf8'
  )
) as WorldAtlasTopology

// The shapes are cached per URL for the page load, so each case reads its own.
describe('useWorldMap', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockImplementation(async () => ({
      ok: true,
      json: async () => atlas
    }))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches the atlas at the given URL and answers its projected shapes', async () => {
    const { result } = renderHook(() =>
      useWorldMap(true, 'https://viewer.example/shapes.json')
    )

    expect(result.current).toEqual({ shapes: null, error: null })
    await waitFor(() => expect(result.current.shapes).not.toBeNull())
    expect(result.current.shapes?.countries.length).toBeGreaterThan(150)
    expect(result.current.error).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith('https://viewer.example/shapes.json')
  })

  it('fetches a URL once per page load, however many maps ask for it', async () => {
    const first = renderHook(() => useWorldMap(true, '/once.json'))
    const second = renderHook(() => useWorldMap(true, '/once.json'))
    await waitFor(() => expect(first.result.current.shapes).not.toBeNull())
    await waitFor(() => expect(second.result.current.shapes).not.toBeNull())

    const later = renderHook(() => useWorldMap(true, '/once.json'))

    expect(later.result.current.shapes).toBe(first.result.current.shapes)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('answers an error, and no shapes, on a response that is not ok', async () => {
    fetchMock.mockImplementation(async () => ({ ok: false, status: 404 }))
    const { result } = renderHook(() => useWorldMap(true, '/missing.json'))

    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.error?.message).toBe('world map 404')
    expect(result.current.shapes).toBeNull()
  })

  it('fetches again after a failure', async () => {
    fetchMock.mockImplementationOnce(async () => ({ ok: false, status: 503 }))
    const failed = renderHook(() => useWorldMap(true, '/flaky.json'))
    await waitFor(() => expect(failed.result.current.error).not.toBeNull())

    const retried = renderHook(() => useWorldMap(true, '/flaky.json'))

    await waitFor(() => expect(retried.result.current.shapes).not.toBeNull())
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('fetches nothing while disabled', () => {
    const { result } = renderHook(() => useWorldMap(false, '/disabled.json'))

    expect(result.current).toEqual({ shapes: null, error: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
