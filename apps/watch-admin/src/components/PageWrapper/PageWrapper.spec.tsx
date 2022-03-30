import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { AuthUser } from 'next-firebase-auth'
import { GET_ME } from './PageWrapper'
import { PageWrapper } from '.'

describe('PageWrapper', () => {
  it('should show title', () => {
    const { getByText } = render(
      <MockedProvider>
        <PageWrapper title="Journeys" />
      </MockedProvider>
    )
    expect(getByText('Journeys')).toBeInTheDocument()
  })

  it('should show back button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <PageWrapper title="Journeys" backHref="/" />
      </MockedProvider>
    )
    expect(getByRole('link')).toHaveAttribute('href', '/')
  })

  it('should show custom menu', () => {
    const { getByText } = render(
      <MockedProvider>
        <PageWrapper title="Journeys" Menu={<>Custom Content</>} />
      </MockedProvider>
    )
    expect(getByText('Custom Content')).toBeInTheDocument()
  })

  it('should show children', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <PageWrapper title="Journeys">
          <div data-testid="test">Hello</div>
        </PageWrapper>
      </MockedProvider>
    )
    expect(getByTestId('test')).toHaveTextContent('Hello')
  })

  it('should have avatar menu', async () => {
    const signOut = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ME
            },
            result: {
              data: {
                me: {
                  id: 'userId',
                  firstName: 'Test',
                  lastName: 'User',
                  imageUrl: 'https://bit.ly/3Gth4Yf',
                  email: 'amin@email.com'
                }
              }
            }
          }
        ]}
      >
        <PageWrapper
          title="Journeys"
          AuthUser={
            {
              displayName: 'Test User',
              photoURL: 'https://bit.ly/3Gth4Yf',
              email: 'amin@email.com',
              signOut
            } as unknown as AuthUser
          }
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('img', { name: 'Test User' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('img', { name: 'Test User' }))
    await waitFor(() => expect(getByText('Test User')).toBeInTheDocument())
    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))
    await waitFor(() => expect(signOut).toHaveBeenCalled())
  })
})
