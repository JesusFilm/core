import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { getVisitorMock, visitorUpdateMock } from './DetailsFormData'

import { DetailsForm } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('DetailsForm', () => {
  it('fetches remote data and fills in form', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getVisitorMock]}>
        <DetailsForm id="visitorId" />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('textbox', { name: 'Username' })).toHaveValue(
        '0800123456'
      )
    )
    expect(getByRole('button', { name: '🎉' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Name' })).toHaveValue('Bilbo Baggins')
    expect(getByRole('textbox', { name: 'Private Note' })).toHaveValue(
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
      expect(getByRole('button', { name: '🎉' })).toBeInTheDocument()
    )
    fireEvent.mouseDown(getByRole('button', { name: '🎉' }))
    fireEvent.click(screen.getByRole('option', { name: '⚪️' }))
    await waitFor(() => expect(visitorUpdateResult).toHaveBeenCalled())
  })
})
