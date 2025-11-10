import { FirebaseError } from 'firebase/app'

type TranslationFunction = (key: string) => string

export function getFirebaseErrorMessage(
  error: FirebaseError | Error,
  t: TranslationFunction
): string {
  const firebaseError = error as FirebaseError

  if (firebaseError.code == null) {
    return error.message
  }

  switch (firebaseError.code) {
    case 'auth/email-already-in-use':
      return t('emailAlreadyInUse')
    case 'auth/invalid-email':
      return t('invalidEmail')
    case 'auth/operation-not-allowed':
      return t('operationNotAllowed')
    case 'auth/weak-password':
      return t('weakPassword')
    case 'auth/user-disabled':
      return t('userDisabled')
    case 'auth/user-not-found':
      return t('userNotFound')
    case 'auth/wrong-password':
      return t('wrongPassword')
    case 'auth/invalid-credential':
      return t('invalidCredential')
    case 'auth/too-many-requests':
      return t('tooManyRequests')
    case 'auth/network-request-failed':
      return t('networkRequestFailed')
    case 'auth/popup-closed-by-user':
      return t('popupClosedByUser')
    case 'auth/cancelled-popup-request':
      return t('cancelledPopupRequest')
    case 'auth/popup-blocked':
      return t('popupBlocked')
    case 'auth/account-exists-with-different-credential':
      return t('accountExistsWithDifferentCredential')
    default:
      return t('default')
  }
}
