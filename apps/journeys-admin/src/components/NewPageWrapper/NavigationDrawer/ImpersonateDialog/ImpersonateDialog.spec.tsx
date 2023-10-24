import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { USER_IMPERSONATE } from './ImpersonateDialog'

import { ImpersonateDialog } from '.'

const onClose = jest.fn()

describe('JourneyView/Menu/ImpersonateDialog', () => {
  it('should not set journey impersonate on close', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <ImpersonateDialog open onClose={onClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Impersonate' }
    })
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('should impersonate user on submit', async () => {
    const result = jest.fn(() => ({
      data: {
        userImpersonate: 'accessToken'
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_IMPERSONATE,
              variables: { email: 'bob.jones@example.com' }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <ImpersonateDialog open onClose={onClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'bob.jones@example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Impersonate' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('shows notistack error alert when impersonate fails to update', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_IMPERSONATE,
              variables: { email: 'bob.jones@example.com' }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <ImpersonateDialog open onClose={onClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'bob.jones@example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Impersonate' }))
    await waitFor(() =>
      expect(
        getByText('Impersonation failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })
})
