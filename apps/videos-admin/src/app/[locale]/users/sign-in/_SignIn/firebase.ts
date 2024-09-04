import type {
  Auth,
  AuthError,
  AuthProvider,
  UserCredential
} from 'firebase/auth'
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  useDeviceLanguage
} from 'firebase/auth'

const CREDENTIAL_ALREADY_IN_USE_ERROR = 'auth/credential-already-in-use'
export const isCredentialAlreadyInUseError = (e: AuthError): boolean =>
  e?.code === CREDENTIAL_ALREADY_IN_USE_ERROR

export const logout = async (auth: Auth): Promise<void> => {
  return await signOut(auth)
}

export const getGoogleProvider = (auth: Auth): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider()
  provider.addScope('profile')
  provider.addScope('email')
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useDeviceLanguage(auth)
  provider.setCustomParameters({
    display: 'popup'
  })

  return provider
}

export const loginWithProvider = async (
  auth: Auth,
  provider: AuthProvider
): Promise<UserCredential> => {
  const result = await signInWithPopup(
    auth,
    provider,
    browserPopupRedirectResolver
  )

  return result
}

export const loginWithProviderUsingRedirect = async (
  auth: Auth,
  provider: AuthProvider
): Promise<void> => {
  await signInWithRedirect(auth, provider)
}
