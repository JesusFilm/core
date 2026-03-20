import { act, render, renderHook, waitFor } from '@testing-library/react'
import { Auth, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { ReactNode } from 'react'

import { User, useAuth } from './authContext'
import { AuthProvider } from './AuthProvider'
import { getFirebaseAuth } from './firebase'

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn()
}))

jest.mock('./firebase', () => ({
  getFirebaseAuth: jest.fn()
}))

const mockGetFirebaseAuth = getFirebaseAuth as jest.MockedFunction<
  typeof getFirebaseAuth
>
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>

const serverUser: User = {
  id: 'server-user-id',
  uid: 'server-user-id',
  email: 'server@example.com',
  displayName: 'Server User',
  photoURL: null,
  phoneNumber: null,
  emailVerified: true,
  token: 'server-token',
  isAnonymous: false,
  providerId: 'google.com'
}

const firebaseUser = {
  uid: 'firebase-user-id',
  email: 'firebase@example.com',
  displayName: 'Firebase User',
  photoURL: 'https://example.com/photo.jpg',
  phoneNumber: '+1234567890',
  emailVerified: true,
  isAnonymous: false,
  providerId: 'google.com',
  getIdToken: jest.fn().mockResolvedValue('firebase-token')
} as unknown as FirebaseUser

function renderAuthHook(
  serverUser: User | null
): ReturnType<typeof renderHook<ReturnType<typeof useAuth>, unknown>> {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <AuthProvider user={serverUser}>{children}</AuthProvider>
    )
  })
}

describe('AuthProvider', () => {
  let authStateCallback: ((user: FirebaseUser | null) => void) | null = null
  const mockUnsubscribe = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    authStateCallback = null
    mockGetFirebaseAuth.mockReturnValue({} as Auth)
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      authStateCallback = callback as (user: FirebaseUser | null) => void
      return mockUnsubscribe
    })
  })

  it('should subscribe to onAuthStateChanged on mount', () => {
    render(
      <AuthProvider user={null}>
        <div />
      </AuthProvider>
    )

    expect(mockGetFirebaseAuth).toHaveBeenCalled()
    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function)
    )
  })

  it('should unsubscribe from onAuthStateChanged on unmount', () => {
    const { unmount } = render(
      <AuthProvider user={null}>
        <div />
      </AuthProvider>
    )

    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should provide serverUser when serverUser is present', () => {
    const { result } = renderAuthHook(serverUser)
    expect(result.current.user).toEqual(serverUser)
  })

  it('should provide null when no serverUser and no Firebase user', () => {
    const { result } = renderAuthHook(null)
    expect(result.current.user).toBeNull()
  })

  it('should provide clientUser from Firebase when serverUser is null', async () => {
    const { result } = renderAuthHook(null)

    await act(async () => {
      authStateCallback?.(firebaseUser)
    })

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: 'firebase-user-id',
        uid: 'firebase-user-id',
        email: 'firebase@example.com',
        displayName: 'Firebase User',
        photoURL: 'https://example.com/photo.jpg',
        phoneNumber: '+1234567890',
        emailVerified: true,
        token: 'firebase-token',
        isAnonymous: false,
        providerId: 'google.com'
      })
    })
  })

  it('should prioritize serverUser over clientUser', async () => {
    const { result } = renderAuthHook(serverUser)

    await act(async () => {
      authStateCallback?.(firebaseUser)
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(serverUser)
    })
  })

  it('should set clientUser to null when Firebase user signs out', async () => {
    const { result } = renderAuthHook(null)

    await act(async () => {
      authStateCallback?.(firebaseUser)
    })

    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
    })

    await act(async () => {
      authStateCallback?.(null)
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
    })
  })

  it('should set clientUser to null when getIdToken fails', async () => {
    const failingFirebaseUser = {
      ...firebaseUser,
      getIdToken: jest.fn().mockRejectedValue(new Error('token error'))
    } as unknown as FirebaseUser

    const { result } = renderAuthHook(null)

    await act(async () => {
      authStateCallback?.(failingFirebaseUser)
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
    })
  })

  it('should detect anonymous Firebase users', async () => {
    const anonymousFirebaseUser = {
      ...firebaseUser,
      uid: 'anon-uid',
      isAnonymous: true,
      email: null,
      displayName: null,
      getIdToken: jest.fn().mockResolvedValue('anon-token')
    } as unknown as FirebaseUser

    const { result } = renderAuthHook(null)

    await act(async () => {
      authStateCallback?.(anonymousFirebaseUser)
    })

    await waitFor(() => {
      expect(result.current.user?.isAnonymous).toBe(true)
      expect(result.current.user?.id).toBe('anon-uid')
    })
  })
})
