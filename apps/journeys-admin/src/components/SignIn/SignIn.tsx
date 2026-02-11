import { useUser } from 'next-firebase-auth'
import { ReactElement, useEffect, useState } from 'react'

import { EmailUsedPage } from './EmailUsedPage'
import { HomePage } from './HomePage'
import { PasswordPage } from './PasswordPage'
import { PasswordResetPage } from './PasswordResetPage'
import { RegisterPage } from './RegisterPage'
import { ResetPasswordSentPage } from './ResetPasswordSentPage'
import { ActivePage, PageProps } from './types'

export function SignIn(): ReactElement {
  const user = useUser()
  const [activePage, setActivePage] = useState<ActivePage>('home')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userPassword, setUserPassword] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!user.clientInitialized) return
    if (user.id == null || user.firebaseUser == null) return
    if (user.firebaseUser.isAnonymous === true) return

    const search = window.location.search
    window.location.assign(`/users/verify${search ? search : ''}`)
  }, [user.clientInitialized, user.id, user.firebaseUser?.isAnonymous])

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
  return <>{page}</>
}
