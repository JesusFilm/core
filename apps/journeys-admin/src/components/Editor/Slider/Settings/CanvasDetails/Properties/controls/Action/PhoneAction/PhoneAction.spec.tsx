import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  ContactActionType
} from '../../../../../../../../../../__generated__/globalTypes'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import {
  blockActionPhoneUpdateMock,
  blockActionPhoneUpdateMockCA
} from '../../../../../../../../../libs/useBlockActionPhoneUpdateMutation/useBlockActionPhoneUpdateMutation.mock'
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
      phone: '+1234567890',
      countryCode: 'US',
      contactAction: ContactActionType.call,
      customizable: false,
      parentStepId: 'step1.id'
    },
    children: [],
    settings: null
  }

  const selectedStep: TreeBlock<BlockFields_StepBlock> = {
    __typename: 'StepBlock',
    id: 'step1.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: 'step-1',
    children: []
  }

  it('displays the country code and phone number', async () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('textbox', { name: 'Country' })).toHaveValue('+1')
    expect(screen.getByRole('textbox', { name: 'Phone Number' })).toHaveValue(
      '234567890'
    )
  })

  it('updates phone number', async () => {
    const result = jest.fn().mockReturnValue(blockActionPhoneUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...blockActionPhoneUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Phone Number' }), {
      target: { value: '9876543210' }
    })
    fireEvent.blur(screen.getByRole('textbox', { name: 'Phone Number' }))
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
    fireEvent.change(screen.getByRole('textbox', { name: 'Phone Number' }), {
      target: { value: '' }
    })
    fireEvent.blur(screen.getByRole('textbox', { name: 'Phone Number' }))
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

    fireEvent.change(screen.getByRole('textbox', { name: 'Phone Number' }), {
      target: { value: 'not-a-phone-number' }
    })
    fireEvent.blur(screen.getByRole('textbox', { name: 'Phone Number' }))
    await waitFor(() =>
      expect(
        screen.getByText('Phone number must use valid digits.')
      ).toBeInTheDocument()
    )
  })

  it('should validate country code field', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const countryInput = screen.getByRole('textbox', { name: 'Country' })
    fireEvent.change(countryInput, { target: { value: 'invalid-code' } })
    fireEvent.keyDown(countryInput, { key: 'Enter', code: 'Enter' })
    await waitFor(() =>
      expect(screen.getByText('Invalid code.')).toBeInTheDocument()
    )
  })

  it('should auto-add plus to country code', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const countryInput = screen.getByRole('textbox', { name: 'Country' })
    fireEvent.change(countryInput, { target: { value: '44' } })
    fireEvent.blur(countryInput)
    await waitFor(() => {
      expect(screen.getByDisplayValue('+44')).toBeInTheDocument()
    })
  })

  it('should not add plus to empty country code', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const countryInput = screen.getByRole('textbox', { name: 'Country' })
    fireEvent.change(countryInput, { target: { value: '' } })
    // The empty string should stay empty
    expect(countryInput).toHaveValue('')
  })

  it('should validate phone number length', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const phoneInput = screen.getByRole('textbox', { name: 'Phone Number' })
    fireEvent.change(phoneInput, { target: { value: '12345678901234567890' } })
    fireEvent.blur(phoneInput)
    await waitFor(() =>
      expect(
        screen.getByText('Phone number must be under 15 digits.')
      ).toBeInTheDocument()
    )
  })

  it('should validate phone number cannot start with 0', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const phoneInput = screen.getByRole('textbox', { name: 'Phone Number' })
    fireEvent.change(phoneInput, { target: { value: '0123456789' } })
    fireEvent.blur(phoneInput)
    await waitFor(() =>
      expect(
        screen.getByText('Phone number cannot start with 0.')
      ).toBeInTheDocument()
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
            contactAction: ContactActionType.text,
            customizable: false,
            parentStepId: 'step1.id'
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
            contactAction: ContactActionType.text,
            customizable: false,
            parentStepId: 'step1.id'
          }
        }
      }
    }

    const result = jest.fn().mockReturnValue(contactActionUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...contactActionUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const smsRadio = screen.getByRole('radio', { name: 'Text (SMS)' })
    fireEvent.click(smsRadio)

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should disable radio buttons when no phone number is set', async () => {
    const selectedBlockWithoutPhone: TreeBlock = {
      ...selectedBlock,
      action: {
        parentBlockId: 'button2.id',
        __typename: 'PhoneAction',
        gtmEventName: 'gtmEventName',
        phone: '',
        countryCode: 'US',
        contactAction: ContactActionType.call,
        customizable: false,
        parentStepId: 'step1.id'
      }
    }

    render(
      <MockedProvider>
        <EditorProvider
          initialState={{ selectedBlock: selectedBlockWithoutPhone }}
        >
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    // Wait for the component to render and check the disabled state
    await waitFor(() => {
      const callRadio = screen.getByRole('radio', { name: 'Call' })
      const smsRadio = screen.getByRole('radio', { name: 'Text (SMS)' })

      expect(callRadio).toBeDisabled()
      expect(smsRadio).toBeDisabled()
    })
  })

  it('should enable radio buttons when phone number is set', async () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const callRadio = screen.getByRole('radio', { name: 'Call' })
    const smsRadio = screen.getByRole('radio', { name: 'Text (SMS)' })

    expect(callRadio).not.toBeDisabled()
    expect(smsRadio).not.toBeDisabled()
  })

  it('should show tooltip when radio buttons are disabled', async () => {
    const selectedBlockWithoutPhone: TreeBlock = {
      ...selectedBlock,
      action: {
        parentBlockId: 'button2.id',
        __typename: 'PhoneAction',
        gtmEventName: 'gtmEventName',
        phone: '',
        countryCode: 'US',
        contactAction: ContactActionType.call,
        customizable: false,
        parentStepId: 'step1.id'
      }
    }

    render(
      <MockedProvider>
        <EditorProvider
          initialState={{ selectedBlock: selectedBlockWithoutPhone }}
        >
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      const callRadio = screen.getByRole('radio', { name: 'Call' })
      expect(callRadio).toBeDisabled()
    })

    const callRadio = screen.getByRole('radio', { name: 'Call' })
    fireEvent.mouseOver(callRadio)

    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
    })
  })

  it('should not call handleContactActionChange when radio is disabled', async () => {
    const selectedBlockWithoutPhone: TreeBlock = {
      ...selectedBlock,
      action: {
        parentBlockId: 'button2.id',
        __typename: 'PhoneAction',
        gtmEventName: 'gtmEventName',
        phone: '',
        countryCode: 'US',
        contactAction: ContactActionType.call,
        customizable: false,
        parentStepId: 'step1.id'
      }
    }

    const result = jest.fn().mockReturnValue(blockActionPhoneUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...blockActionPhoneUpdateMock, result }]}>
        <EditorProvider
          initialState={{ selectedBlock: selectedBlockWithoutPhone }}
        >
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    const smsRadio = screen.getByRole('radio', { name: 'Text (SMS)' })
    fireEvent.click(smsRadio)

    // Should not call the mutation when disabled
    expect(result).not.toHaveBeenCalled()
  })

  it('should validate phone number when country code is filled', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    // Fill in country code but leave phone number empty
    const countryInput = screen.getByRole('textbox', { name: 'Country' })
    fireEvent.change(countryInput, { target: { value: '+1' } })
    fireEvent.blur(countryInput)

    const phoneInput = screen.getByRole('textbox', { name: 'Phone Number' })
    fireEvent.change(phoneInput, { target: { value: '' } })
    fireEvent.blur(phoneInput)

    // Should show phone number validation error
    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
    })
  })

  it('should validate country code when phone number is filled', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    // Fill in phone number but leave country code empty
    const phoneInput = screen.getByRole('textbox', { name: 'Phone Number' })
    fireEvent.change(phoneInput, { target: { value: '1234567890' } })
    fireEvent.blur(phoneInput)

    const countryInput = screen.getByRole('textbox', { name: 'Country' })
    fireEvent.change(countryInput, { target: { value: '' } })
    fireEvent.blur(countryInput)

    // Should show country code validation error
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  it('should validate invalid country code like "+"', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    // Set an invalid calling code that's not empty but invalid
    const countryInput = screen.getByRole('textbox', { name: 'Country' })
    fireEvent.change(countryInput, { target: { value: '+' } })
    fireEvent.blur(countryInput)

    // Should show country code validation error
    await waitFor(() => {
      expect(screen.getByText('Invalid code.')).toBeInTheDocument()
    })
  })

  it('should trigger validation for both empty fields through validateAndSubmit', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    // Set empty country code and phone number to trigger validateAndSubmit
    const countryInput = screen.getByRole('textbox', { name: 'Country' })
    const phoneInput = screen.getByRole('textbox', { name: 'Phone Number' })

    // Clear both fields
    fireEvent.change(countryInput, { target: { value: '' } })
    fireEvent.blur(countryInput)

    fireEvent.change(phoneInput, { target: { value: '' } })
    fireEvent.blur(phoneInput)

    // Both fields should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
    })
  })

  it('should trigger validation for invalid country code through validateAndSubmit', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <PhoneAction />
        </EditorProvider>
      </MockedProvider>
    )

    // Set invalid country code to trigger validateAndSubmit
    const countryInput = screen.getByRole('textbox', { name: 'Country' })
    fireEvent.change(countryInput, { target: { value: 'invalid' } })
    fireEvent.blur(countryInput)

    // Should show country code validation error
    await waitFor(() => {
      expect(screen.getByText('Invalid code.')).toBeInTheDocument()
    })
  })
})
