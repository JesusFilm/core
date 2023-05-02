import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { getVisitorMock, visitorUpdateMock } from './DetailsFormData'
import { DetailsForm } from '.'

describe('DetailsForm', () => {
  it('fetches remote data and fills in form', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getVisitorMock]}>
        <DetailsForm id="visitorId" />
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

  it('submits data when form updated', async () => {
    const visitorUpdateResult = jest.fn(() => visitorUpdateMock.result)
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getVisitorMock,
          { ...visitorUpdateMock, result: visitorUpdateResult }
        ]}
      >
        <DetailsForm id="visitorId" />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Status 🎉' })).toBeInTheDocument()
    )
    fireEvent.mouseDown(getByRole('button', { name: 'Status 🎉' }))
    fireEvent.click(screen.getByRole('option', { name: '⚪️' }))
    jest.runAllTimers()
    await waitFor(() => expect(visitorUpdateResult).toHaveBeenCalled())
  })
})
