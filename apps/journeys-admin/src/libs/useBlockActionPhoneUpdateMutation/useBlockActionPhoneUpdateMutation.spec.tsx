import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../__generated__/BlockFields'
import { ContactActionType } from '../../../__generated__/globalTypes'

import { blockActionPhoneUpdateMock } from './useBlockActionPhoneUpdateMutation.mock'

import { useBlockActionPhoneUpdateMutation } from '.'

describe('useBlockActionPhoneUpdateMutation', () => {
  const block1: ButtonBlock = {
    __typename: 'ButtonBlock',
    id: 'button2.id',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    eventLabel: null,
    label: 'button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    settings: null
  }

  it('should update block action', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(blockActionPhoneUpdateMock.result)

    const { result } = renderHook(() => useBlockActionPhoneUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...blockActionPhoneUpdateMock, result: mockResult }]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](
        block1,
        '+19876543210',
        'US',
        ContactActionType.call,
        false,
        'step1.id'
      )

      expect(mockResult).toHaveBeenCalled()
    })
  })

  it('should update cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'ButtonBlock:button2.id': {
        ...block1
      }
    })

    const { result } = renderHook(() => useBlockActionPhoneUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[blockActionPhoneUpdateMock]} cache={cache}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](
        block1,
        '+19876543210',
        'US',
        ContactActionType.call,
        false,
        'step1.id'
      )

      await waitFor(() =>
        expect(cache.extract()['ButtonBlock:button2.id']).toEqual({
          ...block1,
          action: {
            __typename: 'PhoneAction',
            gtmEventName: null,
            parentBlockId: 'button2.id',
            phone: '+19876543210',
            countryCode: 'US',
            contactAction: ContactActionType.call,
            customizable: false,
            parentStepId: 'step1.id'
          }
        })
      )
    })
  })
})
