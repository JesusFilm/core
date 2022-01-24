import { ReactElement } from 'react'
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction
} from 'next-firebase-auth'
import { SignIn } from '../../src/components/SignIn'

function SignInPage(): ReactElement {
  return <SignIn />
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})()

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})(SignInPage)
