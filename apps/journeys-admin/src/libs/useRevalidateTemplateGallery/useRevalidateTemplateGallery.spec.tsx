import { act, renderHook } from '@testing-library/react'

import {
  REVALIDATE_TEMPLATE_GALLERY_ENDPOINT,
  useRevalidateTemplateGallery
} from './useRevalidateTemplateGallery'

describe('useRevalidateTemplateGallery', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn(
      async () => new Response('{}', { status: 200 })
    ) as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('fires a request per unique slug, dropping empties and duplicates', async () => {
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
        `${REVALIDATE_TEMPLATE_GALLERY_ENDPOINT}?slug=alpha`,
        `${REVALIDATE_TEMPLATE_GALLERY_ENDPOINT}?slug=beta`
      ])
    )
    const [, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(init).toMatchObject({ method: 'GET', credentials: 'same-origin' })
  })

  it('is a no-op when the slug list contains nothing usable', async () => {
    const { result } = renderHook(() => useRevalidateTemplateGallery())

    await act(async () => {
      await result.current([null, undefined, ''])
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('swallows fetch errors so callers never see them', async () => {
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

  it('returns a stable callback identity across re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useRevalidateTemplateGallery()
    )
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
