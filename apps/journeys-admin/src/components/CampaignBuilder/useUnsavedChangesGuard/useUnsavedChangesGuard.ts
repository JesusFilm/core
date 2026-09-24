import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useEffect } from 'react'

/**
 * Warns before leaving the builder with unsaved changes: the browser's
 * beforeunload prompt for tab close / reload, and a confirm() on client-side
 * navigation (Next has no cancellable route event, so the standard pattern
 * is to emit `routeChangeError` and throw to abort).
 */
export function useUnsavedChangesGuard(dirty: boolean): void {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')

  useEffect(() => {
    if (!dirty) return
    const message = t('You have unsaved changes. Leave without saving?')

    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault()
      event.returnValue = message
    }
    function handleRouteChangeStart(url: string): void {
      if (url === router.asPath) return
      if (window.confirm(message)) return
      router.events.emit('routeChangeError')
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'Route change aborted: unsaved campaign changes'
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    router.events.on('routeChangeStart', handleRouteChangeStart)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [dirty, router, t])
}
