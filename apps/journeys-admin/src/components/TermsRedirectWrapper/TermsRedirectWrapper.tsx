import { ReactElement, ReactNode, useState, useEffect } from 'react'
import { gql, useQuery } from '@apollo/client'
import { NextRouter } from 'next/router'

import { GetJourneyProfile } from '../../../__generated__/GetJourneyProfile'

export const GET_JOURNEY_PROFILE = gql`
  query GetJourneyProfile {
    getJourneyProfile {
      id
      userId
      acceptedTermsAt
    }
  }
`

interface TermsRedirectWrapperProps {
  router: NextRouter
  children: ReactNode
}

export function TermsRedirectWrapper({
  router,
  children
}: TermsRedirectWrapperProps): ReactElement {
  const [termsAccepted, setTermsAccepted] = useState(true)
  const { data, loading } = useQuery<GetJourneyProfile>(GET_JOURNEY_PROFILE)

  useEffect(() => {
    !termsAccepted && router.push('/users/terms-and-conditions')
  })

  return (
    <>
      {!loading &&
        (data?.getJourneyProfile !== null
          ? children
          : termsAccepted && setTermsAccepted(false))}
    </>
  )
}
