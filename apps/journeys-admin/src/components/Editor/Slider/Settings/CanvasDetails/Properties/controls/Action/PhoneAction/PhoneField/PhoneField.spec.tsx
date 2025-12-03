import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { PhoneField } from './PhoneField'

// Mock translations to return the key as-is
jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

describe('PhoneField', () => {
  it('renders default values for calling code and phone number', () => {
    render(
      <PhoneField
        callingCode="+7"
        phoneNumber="3333"
        handleCallingCodeChange={jest.fn()}
        handlePhoneNumberChange={jest.fn()}
      />
    )

    const callingCodeInput = screen.getByLabelText('Country')
    const phoneInput = screen.getByLabelText('Phone Number')

    expect(callingCodeInput.value).toBe('+7')
    expect(phoneInput.value).toBe('3333')
  })

  it('submits calling code', async () => {
    const handleCallingCodeChange = jest.fn()

    render(
      <PhoneField
        callingCode="+7"
        phoneNumber="3333"
        handleCallingCodeChange={handleCallingCodeChange}
        handlePhoneNumberChange={jest.fn()}
      />
    )

    const callingCodeInput = screen.getByLabelText('Country')

    fireEvent.blur(callingCodeInput)

    await waitFor(() => {
      expect(handleCallingCodeChange).toHaveBeenCalledWith('+7')
    })
  })

  it('submits phone number', async () => {
    const handlePhoneNumberChange = jest.fn()

    render(
      <PhoneField
        callingCode="+7"
        phoneNumber="3333"
        handleCallingCodeChange={jest.fn()}
        handlePhoneNumberChange={handlePhoneNumberChange}
      />
    )

    const phoneInput = screen.getByLabelText('Phone Number')

    fireEvent.blur(phoneInput)

    await waitFor(() => {
      expect(handlePhoneNumberChange).toHaveBeenCalledWith('3333')
    })
  })
})
