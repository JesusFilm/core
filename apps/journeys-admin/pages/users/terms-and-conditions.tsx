import { ReactElement, useEffect, useState } from 'react'
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { gql, useQuery } from '@apollo/client'
import { GetJourneyProfile } from '../../__generated__/GetJourneyProfile'

import { TermsAndConditions } from '../../src/components/TermsAndConditions'
import i18nConfig from '../../next-i18next.config'

export const GET_JOURNEY_PROFILE = gql`
  query GetJourneyProfile {
    getJourneyProfile {
      id
      userId
      acceptedTermsAt
    }
  }
`

function TermsAndConditionsPage(): ReactElement {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { data, loading } = useQuery<GetJourneyProfile>(GET_JOURNEY_PROFILE)

  const router = useRouter()

  useEffect(() => {
    termsAccepted && router.push('/')
  })

  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      {!loading &&
        (data?.getJourneyProfile === null ? (
          <>
            <NextSeo title={t('Terms and Conditions')} />
            <TermsAndConditions />
          </>
        ) : (
          <>{!termsAccepted && setTermsAccepted(true)}</>
        ))}
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
})

export default withAuthUser({
  whenAuthed: AuthAction.RENDER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TermsAndConditionsPage)
