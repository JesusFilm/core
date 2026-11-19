// Why the proxy sent a user back to /users/sign-in, carried in the
// `error` search param so the sign-in page can explain it.
export const signInErrorParam = 'error'

export const accountCheckFailed = 'account-check-failed'

const signInErrorMessages: Record<string, string> = {
  [accountCheckFailed]:
    "We couldn't load your account after sign-in. Please try again, and contact an administrator if this keeps happening."
}

export function getSignInErrorMessage(code: string | null): string | undefined {
  if (code == null) return undefined

  return signInErrorMessages[code]
}
