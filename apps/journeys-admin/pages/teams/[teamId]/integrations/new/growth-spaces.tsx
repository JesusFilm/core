import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement } from 'react'
import { initAndAuthApp } from '../../../../../src/libs/initAndAuthApp'

function GrowthSpacesConfigPage(): ReactElement {
  // add IntegrationsList component here once merged to prod
  return (
    <div>
      GrowthSpaces Config Page: render component that enables user to set up
      GrowthSpaces
    </div>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { redirect, translations, flags } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  if (flags.integrations !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  return {
    props: {
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(GrowthSpacesConfigPage)
