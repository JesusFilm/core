import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement } from 'react'

interface ValidateEmailProps {
  email: string
  token: string
}
function ValidateEmail({ email, token }: ValidateEmailProps): ReactElement {
  return (
    <div>
      <h1>Validate Email</h1>
      <p>
        Email: {email}
        <br />
        Token: {token}
      </p>
    </div>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {})

export default withUser<ValidateEmailProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ValidateEmail)
