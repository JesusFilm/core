import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useHandleNewAccountRedirect(): void {
  const router = useRouter()

  useEffect(() => {
    const redirectUrl = router.query.redirect as string

    if (
      redirectUrl == null ||
      !redirectUrl.includes('/customize') ||
      redirectUrl.includes('newAccount')
    )
      return

    const separator = redirectUrl.includes('?') ? '&' : '?'
    const updatedRedirectUrl = `${redirectUrl}${separator}newAccount=true`

    void router.push({
      pathname: router.pathname,
      query: { redirect: updatedRedirectUrl }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
