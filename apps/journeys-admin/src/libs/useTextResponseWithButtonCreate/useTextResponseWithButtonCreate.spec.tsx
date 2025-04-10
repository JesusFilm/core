import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../__generated__/globalTypes'

import { useTextResponseWithButtonCreate } from './useTextResponseWithButtonCreate'
import { textResponseWithButtonCreateMock } from './useTextResponseWithButtonCreate.mock'

describe('useTextResponseWithButtonCreate', () => {
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
      required: null,
      __typename: 'TextResponseBlock' as const
    } satisfies TextResponseBlock,
    buttonBlock: {
      id: 'button.id',
      parentBlockId: 'card.id',
      parentOrder: 1,
      label: '',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.primary,
      size: ButtonSize.medium,
      startIconId: 'startIcon.id',
      endIconId: 'endIcon.id',
      action: null,
      submitEnabled: true,
      __typename: 'ButtonBlock' as const
    } satisfies ButtonBlock
  }

  it('should create text response with button', async () => {
    const { result: hookResult } = renderHook(
      () => useTextResponseWithButtonCreate(),
      {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[textResponseWithButtonCreateMock]}>
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      hookResult.current[0](blocks, 'journey.id')
    })

    await waitFor(() =>
      expect(textResponseWithButtonCreateMock.result).toHaveBeenCalled()
    )
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

    const { result } = renderHook(() => useTextResponseWithButtonCreate(), {
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
      result.current[0](blocks, 'journey.id')
    })

    await waitFor(async () => {
      expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
        { __ref: 'TextResponseBlock:textResponse.id' },
        { __ref: 'ButtonBlock:button.id' },
        { __ref: 'IconBlock:startIcon.id' },
        { __ref: 'IconBlock:endIcon.id' }
      ])
    })
  })
})
