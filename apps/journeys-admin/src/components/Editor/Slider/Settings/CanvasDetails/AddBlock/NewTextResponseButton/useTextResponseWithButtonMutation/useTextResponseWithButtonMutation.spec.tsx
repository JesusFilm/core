import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../../__generated__/globalTypes'

import { useTextResponseWithButtonMutation } from './useTextResponseWithButtonMutation'
import {
  textResponseWithButtonCreateMock,
  textResponseWithButtonDeleteMock,
  textResponseWithButtonRestoreMock
} from './useTextResponseWithButtonMutation.mock'

describe('useTextResponseWithButtonMutation', () => {
  const blocks = {
    textResponseBlock: {
      id: 'textResponse.id',
      parentBlockId: 'card.id',
      parentOrder: 0,
      label: 'Label',
      hint: null,
      minRows: null,
      type: null,
      routeId: null,
      integrationId: null,
      placeholder: null,
      __typename: 'TextResponseBlock' as const
    } as TextResponseBlock,
    buttonBlock: {
      id: 'button.id',
      parentBlockId: 'card.id',
      parentOrder: 1,
      label: 'Submit',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.primary,
      size: ButtonSize.medium,
      startIconId: 'startIcon.id',
      endIconId: 'endIcon.id',
      action: null,
      submitEnabled: true,
      __typename: 'ButtonBlock' as const
    } as ButtonBlock
  }

  describe('create', () => {
    it('should create text response with button', async () => {
      const result = jest
        .fn()
        .mockReturnValue(textResponseWithButtonCreateMock.result)

      const { result: hookResult } = renderHook(
        () => useTextResponseWithButtonMutation(),
        {
          wrapper: ({ children }) => (
            <MockedProvider
              mocks={[{ ...textResponseWithButtonCreateMock, result }]}
            >
              {children}
            </MockedProvider>
          )
        }
      )

      await act(async () => {
        hookResult.current.create(blocks, 'journey.id')
      })

      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should update cache after creation', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey.id': {
          blocks: [],
          id: 'journey.id',
          __typename: 'Journey'
        }
      })

      const { result } = renderHook(() => useTextResponseWithButtonMutation(), {
        wrapper: ({ children }) => (
          <MockedProvider
            cache={cache}
            mocks={[textResponseWithButtonCreateMock]}
          >
            {children}
          </MockedProvider>
        )
      })

      await act(async () => {
        result.current.create(blocks, 'journey.id')
      })

      await waitFor(() => {
        expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
          { __ref: 'TextResponseBlock:textResponse.id' },
          { __ref: 'ButtonBlock:button.id' },
          { __ref: 'IconBlock:startIcon.id' },
          { __ref: 'IconBlock:endIcon.id' }
        ])
      })
    })
  })

  describe('remove', () => {
    it('should remove text response with button', async () => {
      const result = jest
        .fn()
        .mockReturnValue(textResponseWithButtonDeleteMock.result)

      const { result: hookResult } = renderHook(
        () => useTextResponseWithButtonMutation(),
        {
          wrapper: ({ children }) => (
            <MockedProvider
              mocks={[{ ...textResponseWithButtonDeleteMock, result }]}
            >
              {children}
            </MockedProvider>
          )
        }
      )

      await act(async () => {
        hookResult.current.remove(blocks, 'journey.id')
      })

      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    // TODO: fix this test
    it.skip('should update cache after removal', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey.id': {
          blocks: [
            { __ref: 'TextResponseBlock:textResponse.id' },
            { __ref: 'ButtonBlock:button.id' },
            { __ref: 'IconBlock:startIcon.id' },
            { __ref: 'IconBlock:endIcon.id' }
          ],
          id: 'journey.id',
          __typename: 'Journey'
        }
      })

      const { result } = renderHook(() => useTextResponseWithButtonMutation(), {
        wrapper: ({ children }) => (
          <MockedProvider
            cache={cache}
            mocks={[textResponseWithButtonDeleteMock]}
          >
            {children}
          </MockedProvider>
        )
      })

      await act(async () => {
        result.current.remove(blocks, 'journey.id')
      })

      await waitFor(() => {
        expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([])
      })
    })
  })

  describe('restore', () => {
    it('should restore text response with button', async () => {
      const result = jest
        .fn()
        .mockReturnValue(textResponseWithButtonRestoreMock.result)

      const { result: hookResult } = renderHook(
        () => useTextResponseWithButtonMutation(),
        {
          wrapper: ({ children }) => (
            <MockedProvider
              mocks={[{ ...textResponseWithButtonRestoreMock, result }]}
            >
              {children}
            </MockedProvider>
          )
        }
      )

      await act(async () => {
        hookResult.current.restore(blocks, 'journey.id')
      })

      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    // TODO: fix this test
    it.skip('should update cache after restoration', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey.id': {
          blocks: [],
          id: 'journey.id',
          __typename: 'Journey'
        }
      })

      const { result } = renderHook(() => useTextResponseWithButtonMutation(), {
        wrapper: ({ children }) => (
          <MockedProvider
            cache={cache}
            mocks={[textResponseWithButtonRestoreMock]}
          >
            {children}
          </MockedProvider>
        )
      })

      await act(async () => {
        result.current.restore(blocks, 'journey.id')
      })

      await waitFor(() => {
        expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
          { __ref: 'TextResponseBlock:textResponse.id' },
          { __ref: 'ButtonBlock:button.id' },
          { __ref: 'IconBlock:startIcon.id' },
          { __ref: 'IconBlock:endIcon.id' }
        ])
      })
    })
  })

  describe('loading state', () => {
    it('should return loading state from mutation result', () => {
      const { result } = renderHook(() => useTextResponseWithButtonMutation(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[]}>{children}</MockedProvider>
        )
      })

      expect(result.current.result.loading).toBe(false)
    })
  })
})
