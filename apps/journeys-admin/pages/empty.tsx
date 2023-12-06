import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { initAndAuthApp } from '../src/libs/initAndAuthApp'

function EmptyPage(): ReactElement {
  return <>HELLO</>
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(EmptyPage)
