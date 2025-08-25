import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../../../__generated__/globalTypes'
import { blockActionEmailUpdateMock } from '../../../../../../../../../libs/useBlockActionEmailUpdateMutation/useBlockActionEmailUpdateMutation.mock'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { PhoneAction } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('PhoneAction', () => {
  const selectedBlock: TreeBlock = {
    __typename: 'ButtonBlock',
    id: 'button2.id',
    parentBlockId: 'card1.id',
    parentOrder: 4,
    label: 'Contact Us',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: {
      parentBlockId: 'button2.id',
      __typename: 'PhoneAction',
      gtmEventName: 'gtmEventName',
      phone: '+1234567890'
    },
    children: [],
    settings: null
  }

  it('displays the action phone number', async () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
  })

  it('updates action phone number', async () => {
    const result = jest.fn().mockReturnValue(blockActionEmailUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...blockActionEmailUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '+9876543210' }
    })
    fireEvent.submit(screen.getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('is a required field', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Paste Phone Number here...' }),
      {
        target: { value: '' }
      }
    )
    fireEvent.blur(
      screen.getByRole('textbox', { name: 'Paste Phone Number here...' })
    )
    await waitFor(() =>
      expect(screen.getByText('Invalid Phone Number')).toBeInTheDocument()
    )
  })

  it('should validate on incorrect phone number format', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'not-a-phone-number' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() =>
      expect(
        screen.getByText('Phone number must be a valid format')
      ).toBeInTheDocument()
    )
  })

  it('should handle undo', async () => {
    const result = jest
      .fn()
      .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)
    render(
      <MockedProvider
        mocks={[
          blockActionEmailUpdateMock,
          { ...blockActionNavigateToBlockUpdateMock, result }
        ]}
      >
        <EditorProvider
          initialState={{
            selectedBlock: {
              ...selectedBlock,
              action: {
                parentBlockId: 'button2.id',
                __typename: 'NavigateToBlockAction',
                gtmEventName: 'gtmEventName',
                blockId: 'step2.id'
              }
            }
          }}
        >
          <PhoneAction />
          <CommandUndoItem variant="button" />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '+9876543210' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
