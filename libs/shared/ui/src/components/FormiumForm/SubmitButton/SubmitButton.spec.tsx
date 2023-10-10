import { render } from '@testing-library/react'

import ArrowLeftIcon from '../../icons/ArrowLeft'
import { FormiumProvider } from '../FormiumProvider'

import { SubmitButton } from '.'

describe('SubmitButton', () => {
  it('should show default button', () => {
    const { getByRole, getByTestId } = render(
      <FormiumProvider>
        <SubmitButton type="submit">Submit</SubmitButton>
      </FormiumProvider>
    )

    expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(getByTestId('CheckBrokenIcon')).toBeInTheDocument()
  })

  it('should show custom button', () => {
    const { getByRole, getByTestId } = render(
      <FormiumProvider
        value={{ submitText: 'custom text', submitIcon: <ArrowLeftIcon /> }}
      >
        <SubmitButton type="submit">Submit</SubmitButton>
      </FormiumProvider>
    )

    expect(getByRole('button', { name: 'custom text' })).toBeInTheDocument()
    expect(getByTestId('ArrowLeftIcon')).toBeInTheDocument()
  })
})
