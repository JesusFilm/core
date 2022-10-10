import { ReactElement } from 'react'
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'

function ReportsPage(): ReactElement {
  return <></>
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async () => {
  return {
    redirect: {
      destination: '/reports/journeys',
      permanent: false
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ReportsPage)
