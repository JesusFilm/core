import { gql, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useUser } from 'next-firebase-auth'
import { useEffect, useMemo, useRef, useState } from 'react'

export const INTEGRATION_GOOGLE_CREATE = gql`
  mutation IntegrationGoogleCreate($input: IntegrationGoogleCreateInput!) {
    integrationGoogleCreate(input: $input) {
      id
    }
  }
`

interface UseIntegrationGoogleCreateOptions {
  teamId?: string
  onSuccess?: (integrationId: string) => void | Promise<void>
  onError?: (error: Error) => void
}

interface UseIntegrationGoogleCreateResult {
  loading: boolean
}

/**
 * Watches for an OAuth `code` query param and automatically exchanges it
 * for a Google integration via the `integrationGoogleCreate` mutation.
 *
 * Cleans the `code` param from the URL immediately to prevent re-triggers.
 */
export function useIntegrationGoogleCreate({
  teamId,
  onSuccess,
  onError
}: UseIntegrationGoogleCreateOptions): UseIntegrationGoogleCreateResult {
  const router = useRouter()
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [integrationGoogleCreate] = useMutation(INTEGRATION_GOOGLE_CREATE)
  const hasAttemptedExchangeRef = useRef(false)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  const redirectUri = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return `${window.location.origin}/api/integrations/google/callback`
  }, [])

  useEffect(() => {
    const authCode = router.query.code as string | undefined
    if (authCode == null || teamId == null || redirectUri == null) return
    if (!user.clientInitialized) return
    if (hasAttemptedExchangeRef.current) return
    hasAttemptedExchangeRef.current = true

    setLoading(true)

    const newQuery = { ...router.query }
    delete newQuery.code
    void router.replace(
      { pathname: router.pathname, query: newQuery },
      undefined,
      { shallow: true }
    )

    async function exchangeCode(): Promise<void> {
      try {
        const { data } = await integrationGoogleCreate({
          variables: {
            input: { teamId, code: authCode, redirectUri }
          },
          refetchQueries: ['GetIntegration'],
          awaitRefetchQueries: true
        })

        const integrationId = data?.integrationGoogleCreate?.id
        if (integrationId != null) {
          await onSuccessRef.current?.(integrationId)
        } else {
          onErrorRef.current?.(new Error('Integration creation returned no ID'))
        }
      } catch (error) {
        onErrorRef.current?.(
          error instanceof Error ? error : new Error(String(error))
        )
      } finally {
        setLoading(false)
      }
    }

    void exchangeCode()
  }, [
    router,
    teamId,
    redirectUri,
    integrationGoogleCreate,
    user.clientInitialized
  ])

  return { loading }
}
