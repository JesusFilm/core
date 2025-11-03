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

import { useTextResponseWithButtonDelete } from './useTextResponseWithButtonDelete'
import { textResponseWithButtonDeleteMock } from './useTextResponseWithButtonDelete.mock'

describe('useTextResponseWithButtonDelete', () => {
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
      __typename: 'TextResponseBlock' as const,
      hideLabel: false
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
      settings: null,
      __typename: 'ButtonBlock' as const
    } satisfies ButtonBlock
  }

  it('should delete text response with button', async () => {
    const { result: hookResult } = renderHook(
      () => useTextResponseWithButtonDelete(),
      {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[textResponseWithButtonDeleteMock]}>
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      hookResult.current[0](blocks, 'journey.id')
    })

    await waitFor(() =>
      expect(textResponseWithButtonDeleteMock.result).toHaveBeenCalled()
    )
  })
})
