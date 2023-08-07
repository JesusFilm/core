import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { SignIn } from '../../src/components/SignIn'

function SignInPage(): ReactElement {
  return (
    <>
      <NextSeo title="Sign In" />
      <SignIn />
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})()

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})(SignInPage)
