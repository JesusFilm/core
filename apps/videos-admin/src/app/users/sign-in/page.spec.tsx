import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { UserCredential, signInWithEmailAndPassword } from 'firebase/auth'
import { useSearchParams } from 'next/navigation'

import { loginWithGoogle } from '../../../libs/auth/firebase'

import SignIn from './page'

async function fillPasswordForm(): Promise<void> {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'user@example.com' }
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password' }
  })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
  useSearchParams: vi.fn()
}))

vi.mock('../../../libs/auth/firebase', () => ({
  getFirebaseAuth: vi.fn(() => ({})),
  loginWithGoogle: vi.fn()
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn()
}))

const credential = {
  user: { getIdToken: vi.fn().mockResolvedValue('id-token') }
} as unknown as UserCredential

function mockSearchParams(query = ''): void {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as unknown as ReturnType<typeof useSearchParams>
  )
}

describe('SignIn', () => {
  const fetchMock = vi.fn()
  const assignMock = vi.fn()

  beforeEach(() => {
    mockSearchParams()
    vi.mocked(loginWithGoogle).mockResolvedValue(credential)
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('location', { ...window.location, assign: assignMock })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
    assignMock.mockReset()
  })

  it('shows Login Failed and the sign-in form when /api/login is not ok', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }))

    render(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    expect(await screen.findByText('Login Failed')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sign in with Google' })
    ).toBeEnabled()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(assignMock).not.toHaveBeenCalled()
  })

  it('does a full-page navigation after a successful login so a bounce back to sign-in remounts the page', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))

    render(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    await waitFor(() => expect(assignMock).toHaveBeenCalledWith('/'))
  })

  it('navigates to a same-origin redirect param after login', async () => {
    mockSearchParams('redirect=/languages')
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))

    render(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    await waitFor(() => expect(assignMock).toHaveBeenCalledWith('/languages'))
  })

  it('ignores an off-site redirect param', async () => {
    mockSearchParams('redirect=//evil.example')
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))

    render(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    await waitFor(() => expect(assignMock).toHaveBeenCalledWith('/'))
  })

  it('ignores a backslash-prefixed off-site redirect param', async () => {
    mockSearchParams('redirect=%2F%5Cevil.example')
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))

    render(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    await waitFor(() => expect(assignMock).toHaveBeenCalledWith('/'))
  })

  it('explains why the user was sent back when the account check failed', () => {
    mockSearchParams('error=account-check-failed')

    render(<SignIn />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      "We couldn't load your account after sign-in."
    )
    expect(
      screen.getByRole('button', { name: 'Sign in with Google' })
    ).toBeInTheDocument()
  })

  it('clears a stale password error once a Google attempt fails with its own error', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      new Error('Wrong password')
    )
    vi.mocked(loginWithGoogle).mockRejectedValue(new Error('Google failed'))

    render(<SignIn />)

    await fillPasswordForm()
    expect(await screen.findByText('Wrong password')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    expect(await screen.findByText('Google failed')).toBeInTheDocument()
    expect(screen.queryByText('Wrong password')).not.toBeInTheDocument()
  })
})
