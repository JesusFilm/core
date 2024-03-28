import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useHandleNewAccountRedirect(): void {
  const router = useRouter()

  useEffect(() => {
    const redirectUrl = router.query.redirect as string

    let updatedRedirectUrl

    const containsNewAccount = redirectUrl?.includes('newAccount')
    const containsCreateNew = redirectUrl?.includes('createNew')

    if (!containsNewAccount) {
      if (containsCreateNew && redirectUrl != null) {
        updatedRedirectUrl = `${redirectUrl ?? ''}&newAccount=true`
      } else {
        updatedRedirectUrl = `${window.location.origin}?newAccount=true`
      }
    }

    if (updatedRedirectUrl != null) {
      void router.push({
        pathname: router.pathname,
        query: { redirect: updatedRedirectUrl }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
