import { act, renderHook } from '@testing-library/react'

import { useRevalidateTemplateGallery } from './useRevalidateTemplateGallery'

const ENDPOINT = '/api/revalidate-template-gallery'

describe('useRevalidateTemplateGallery', () => {
  const originalFetch = global.fetch
  let consoleWarn: jest.SpyInstance

  beforeEach(() => {
    global.fetch = jest.fn(
      async () => new Response('{}', { status: 200 })
    ) as unknown as typeof fetch
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    global.fetch = originalFetch
    consoleWarn.mockRestore()
  })

  it('fires a POST per unique slug with the CSRF header, dropping empties and duplicates', async () => {
    const { result } = renderHook(() => useRevalidateTemplateGallery())

    await act(async () => {
      await result.current(['alpha', 'alpha', '', null, undefined, 'beta'])
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
    const urls = (global.fetch as jest.Mock).mock.calls.map(
      ([url]) => url as string
    )
    expect(urls).toEqual(
      expect.arrayContaining([
        `${ENDPOINT}?slug=alpha`,
        `${ENDPOINT}?slug=beta`
      ])
    )
    const [, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(init).toMatchObject({
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
  })

  it('is a no-op when the slug list contains nothing usable', async () => {
    const { result } = renderHook(() => useRevalidateTemplateGallery())

    await act(async () => {
      await result.current([null, undefined, ''])
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('swallows network errors so callers never see them', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('network down')
    )
    const { result } = renderHook(() => useRevalidateTemplateGallery())

    await expect(
      act(async () => {
        await result.current(['alpha'])
      })
    ).resolves.toBeUndefined()
  })

  it('logs a warning when fetch resolves with a non-OK status', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 502
    } as never)
    const { result } = renderHook(() => useRevalidateTemplateGallery())

    await act(async () => {
      await result.current(['alpha'])
    })

    expect(consoleWarn).toHaveBeenCalledWith(
      'revalidate failed',
      expect.objectContaining({ slug: 'alpha', status: 502 })
    )
  })
})
