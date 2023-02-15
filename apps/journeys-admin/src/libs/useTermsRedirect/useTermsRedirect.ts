import { useEffect } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
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

export function useTermsRedirect(): boolean {
  const router = useRouter()
  const { data, loading } = useQuery<GetJourneyProfile>(GET_JOURNEY_PROFILE)

  useEffect(() => {
    !loading &&
      data?.getJourneyProfile === null &&
      router.push('/users/terms-and-conditions')
  })

  return !loading && data?.getJourneyProfile !== null
}
