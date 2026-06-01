import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { getVisitorMock, visitorUpdateMock } from './DetailsFormData'

import { DetailsForm } from '.'

describe('DetailsForm', () => {
  it('fetches remote data and fills in form', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getVisitorMock]}>
        <DetailsForm id="visitorId" />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('textbox', { name: 'Username' })).toHaveValue(
        '0800123456'
      )
    )
    expect(getByText('🎉')).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Name' })).toHaveValue('Bilbo Baggins')
    expect(getByRole('textbox', { name: 'Private Note' })).toHaveValue(
      'Has a ring to give you.'
    )
  })

  it('submits data when form updated', async () => {
    const visitorUpdateResult = vi.fn(() => visitorUpdateMock.result)
    const { getByText } = render(
      <MockedProvider
        mocks={[
          getVisitorMock,
          { ...visitorUpdateMock, result: visitorUpdateResult }
        ]}
      >
        <DetailsForm id="visitorId" />
      </MockedProvider>
    )
    await waitFor(() => expect(getByText('🎉')).toBeInTheDocument())
    fireEvent.mouseDown(getByText('🎉'))
    fireEvent.click(screen.getByRole('option', { name: '⚪️' }))
    await waitFor(() => expect(visitorUpdateResult).toHaveBeenCalled())
  })
})
