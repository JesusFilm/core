import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import { useAuth } from '../../libs/auth'

import { EmailUsedPage } from './EmailUsedPage'
import { HomePage } from './HomePage'
import { PasswordPage } from './PasswordPage'
import { PasswordResetPage } from './PasswordResetPage'
import { RegisterPage } from './RegisterPage'
import { ResetPasswordSentPage } from './ResetPasswordSentPage'
import { ActivePage, PageProps } from './types'

export function SignIn(): ReactElement {
  const router = useRouter()
  const { user } = useAuth()
  const [activePage, setActivePage] = useState<ActivePage>('home')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userPassword, setUserPassword] = useState<string>('')

  function getSearchFromAsPath(asPath: string): string {
    const index = asPath.indexOf('?')
    return index === -1 ? '' : asPath.slice(index)
  }

  useEffect(() => {
    if (user == null) return
    if (user.isAnonymous === true) return

    // This page only renders when the server found no valid session cookie, so
    // a client-side Firebase user here may be stale. /users/verify redirects
    // straight back when the cookie is missing, and arriving with
    // ?redirect=/users/verify means we have already made that round trip —
    // going again would bounce forever.
    const redirect = router.query.redirect
    if (typeof redirect === 'string' && redirect.startsWith('/users/verify'))
      return

    const search = getSearchFromAsPath(router.asPath)
    void router.replace(`/users/verify${search}`)
  }, [router, user?.id, user?.isAnonymous])

  let page: ReactElement<PageProps>
  const props: PageProps = {
    activePage,
    setActivePage,
    userEmail,
    setUserEmail,
    userPassword,
    setUserPassword
  }

  switch (activePage) {
    case 'home':
      page = <HomePage {...props} />
      break
    case 'password':
      page = <PasswordPage {...props} />
      break
    case 'register':
      page = <RegisterPage {...props} />
      break
    case 'google.com':
      page = <EmailUsedPage {...props} activePage="google.com" />
      break
    case 'facebook.com':
      page = <EmailUsedPage {...props} activePage="facebook.com" />
      break
    case 'oidc.okta':
      page = <EmailUsedPage {...props} activePage="oidc.okta" />
      break
    case 'help':
      page = <PasswordResetPage {...props} />
      break
    case 'reset':
      page = <ResetPasswordSentPage {...props} />
      break
    default:
      page = <></>
      break
  }
  return page
}
