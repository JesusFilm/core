import { useRouter } from 'next/router'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement, useEffect } from 'react'

import { Loader } from '../src/components/Loader'

function Index(): ReactElement {
  const router = useRouter()

  useEffect(() => {
    const redirectToDashboard = (): void => {
      void router.push('/channels')
    }

    redirectToDashboard()
  }, [router])

  return <Loader />
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {
  const token = await user?.getIdToken()

  return {
    props: {
      token
    }
  }
})

export default withUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: Loader
})(Index)
