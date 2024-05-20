import { MockedProvider } from '@apollo/client/testing'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CreateShortLinkModal } from './CreateShortLinkModal'

describe('CreateShortLinkModal', () => {
  it('renders correctly', async () => {
    let isOpen = true

    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}
          >
            <CreateShortLinkModal
              open={isOpen}
              onClose={() => {
                isOpen = false
              }}
              refetch={() => console.log('Refetching...')}
            />
          </GoogleOAuthProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByText(/create short link/i)).toBeInTheDocument()
  })

  it('calls on close', () => {
    const handleClose = jest.fn()

    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}
          >
            <CreateShortLinkModal
              open
              onClose={handleClose}
              refetch={() => console.log('Refetching...')}
            />
          </GoogleOAuthProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByText(/cancel/i))
    expect(handleClose).toHaveBeenCalled()
  })
})
