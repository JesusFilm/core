import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  ContactActionType
} from '../../../../../../../../../../__generated__/globalTypes'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { PhoneAction } from '.'
import { blockActionPhoneUpdateMock } from '../../../../../../../../../libs/useBlockActionPhoneUpdateMutation/useBlockActionPhoneUpdateMutation.mock'

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
      phone: '+1234567890',
      countryCode: 'US',
      contactAction: ContactActionType.call
    },
    children: [],
    settings: null
  }

  it('displays the country code and phone number', async () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('startAdornment')).toHaveTextContent('+1')
    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveValue(
      '234567890'
    )
  })

  it('updates phone number', async () => {
    const result = jest.fn().mockReturnValue(blockActionPhoneUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...blockActionPhoneUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Phone number' }), {
      target: { value: '9876543210' }
    })
    fireEvent.blur(screen.getByRole('textbox', { name: 'Phone number' }))
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
    fireEvent.change(screen.getByRole('textbox', { name: 'Phone number' }), {
      target: { value: '' }
    })
    fireEvent.blur(screen.getByRole('textbox', { name: 'Phone number' }))
    await waitFor(() =>
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
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

    fireEvent.change(screen.getByRole('textbox', { name: 'Phone number' }), {
      target: { value: 'not-a-phone-number' }
    })
    fireEvent.blur(screen.getByRole('textbox', { name: 'Phone number' }))
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
          blockActionPhoneUpdateMock,
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
    fireEvent.change(screen.getByRole('textbox', { name: 'Phone number' }), {
      target: { value: '9876543210' }
    })
    fireEvent.blur(screen.getByRole('textbox', { name: 'Phone number' }))
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should show countries in alphabetical order', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.focus(screen.getByRole('combobox', { name: 'Country' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Country' }), {
      key: 'ArrowDown'
    })
    expect(screen.queryAllByRole('option')[0]).toHaveTextContent(
      'Afghanistan (AF) +93'
    )
    expect(screen.queryAllByRole('option')[1]).toHaveTextContent(
      'Albania (AL) +355'
    )
    expect(screen.queryAllByRole('option')[2]).toHaveTextContent(
      'Algeria (DZ) +213'
    )
  })

  it('should select country via option click', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.focus(screen.getByRole('combobox', { name: 'Country' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Country' }), {
      key: 'ArrowDown'
    })
    fireEvent.click(
      screen.getByRole('option', {
        name: 'Canada flag Canada (CA) +1'
      })
    )
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue(
        'Canada'
      )
    )
  })

  it('should reset phone number when country changes', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const phoneInput = screen.getByRole('textbox', { name: 'Phone number' })
    fireEvent.change(phoneInput, { target: { value: '1234567890' } })
    expect(phoneInput).toHaveValue('1234567890')

    fireEvent.focus(screen.getByRole('combobox', { name: 'Country' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Country' }), {
      key: 'ArrowDown'
    })
    fireEvent.click(
      screen.getByRole('option', {
        name: 'Canada flag Canada (CA) +1'
      })
    )

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveValue(
        ''
      )
    )
  })

  it('should update contact action', async () => {
    const contactActionUpdateMock = {
      ...blockActionPhoneUpdateMock,
      request: {
        ...blockActionPhoneUpdateMock.request,
        variables: {
          id: 'button2.id',
          input: {
            phone: '+1234567890',
            countryCode: 'US',
            contactAction: ContactActionType.text
          }
        }
      },
      result: {
        data: {
          blockUpdatePhoneAction: {
            __typename: 'PhoneAction',
            parentBlockId: 'button2.id',
            gtmEventName: null,
            phone: '+1234567890',
            countryCode: 'US',
            contactAction: ContactActionType.text
          }
        }
      }
    }

    const result = jest.fn().mockReturnValue(contactActionUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...contactActionUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const smsRadio = screen.getByRole('radio', { name: 'SMS' })
    fireEvent.click(smsRadio)

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
