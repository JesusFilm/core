import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'

import { useCommonVideoVariantLanguages } from './useCommonVideoVariantLanguages'
import {
  journey,
  journeyInternalVideosMock,
  journeyInternalWithoutVideosMock,
  videosVariantLanguagesMock,
  videosVariantLanguagesWithoutVideosMock
} from './useCommonVideoVariantLanguages.mock'

describe('useCommonVideoVariantLanguages', () => {
  it('should return common languages across all videos', async () => {
    const { result } = renderHook(
      () => useCommonVideoVariantLanguages(journey),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[journeyInternalVideosMock, videosVariantLanguagesMock]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.commonLanguages).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.commonLanguages).toEqual(['529', '584'])
  })

  it('should handle journey with no videos', async () => {
    const { result } = renderHook(
      () => useCommonVideoVariantLanguages(journey),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              journeyInternalWithoutVideosMock,
              videosVariantLanguagesWithoutVideosMock
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.commonLanguages).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.commonLanguages).toEqual([])
  })

  it('should handle undefined journey', () => {
    const { result } = renderHook(() => useCommonVideoVariantLanguages(), {
      wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider>
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.commonLanguages).toEqual([])
  })
})
