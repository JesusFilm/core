import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { getVisitorMock } from './VisitorDetailFormData'
import { VisitorDetailForm } from '.'

describe('VisitorDetailForm', () => {
  it('fetches remote data and fills in form', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getVisitorMock]}>
        <VisitorDetailForm id="visitorId" />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('textbox', { name: 'WhatsApp' })).toHaveValue(
        '0800123456'
      )
    )
    expect(getByRole('button', { name: 'Status 🎉' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Name' })).toHaveValue('Bilbo Baggins')
    expect(getByRole('textbox', { name: 'Notes' })).toHaveValue(
      'Has a ring to give you.'
    )
  })
})
