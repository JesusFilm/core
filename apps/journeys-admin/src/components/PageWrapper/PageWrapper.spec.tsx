import { fireEvent, render, waitFor } from '@testing-library/react'
import { AuthUser } from 'next-firebase-auth'
import { PageWrapper } from './PageWrapper'

describe('PageWrapper', () => {
  it('should show title', () => {
    const { getByText } = render(<PageWrapper title="Journeys" />)
    expect(getByText('Journeys')).toBeInTheDocument()
  })

  it('should show back button', () => {
    const { getByRole } = render(<PageWrapper title="Journeys" backHref="/" />)
    expect(getByRole('link')).toHaveAttribute('href', '/')
  })

  it('should show custom menu', () => {
    const { getByText } = render(
      <PageWrapper title="Journeys" Menu={<>Custom Content</>} />
    )
    expect(getByText('Custom Content')).toBeInTheDocument()
  })

  it('should show children', () => {
    const { getByTestId } = render(
      <PageWrapper title="Journeys">
        <div data-testid="test">Hello</div>
      </PageWrapper>
    )
    expect(getByTestId('test')).toHaveTextContent('Hello')
  })

  it('should have avatar menu', async () => {
    const signOut = jest.fn()
    const { getByRole, getByText } = render(
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
    )
    fireEvent.click(getByRole('img', { name: 'Test User' }))
    await waitFor(() => expect(getByText('Test User')).toBeInTheDocument())
    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))
    await waitFor(() => expect(signOut).toHaveBeenCalled())
  })
})
