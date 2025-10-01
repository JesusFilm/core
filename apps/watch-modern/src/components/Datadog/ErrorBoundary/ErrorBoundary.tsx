'use client'

import { ErrorBoundary } from '@datadog/browser-rum-react'
import { useTranslations } from 'next-intl'

/**
 * DatadogErrorBoundary component for catching and reporting React errors
 *
 * This component wraps your application to catch JavaScript errors anywhere in the
 * child component tree and automatically report them to Datadog RUM.
 *
 * @example
 * ```tsx
 * <DatadogErrorBoundary>
 *   <YourApp />
 * </DatadogErrorBoundary>
 * ```
 */
export default function DatadogErrorBoundary({
  children
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('DatadogErrorBoundary')

  return (
    <ErrorBoundary
      fallback={({ error, resetError: handleResetError }) => (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {t('somethingWentWrong')}
            </h2>
            <p className="mb-4 text-gray-600">{t('anErrorOccurred')}</p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-500">
                {t('errorDetails')}
              </summary>
              <pre className="mt-2 rounded bg-gray-100 p-2 text-xs text-gray-700">
                {error?.message || t('unknownError')}
              </pre>
            </details>
            <button
              onClick={handleResetError}
              aria-label={t('tryAgain')}
              tabIndex={0}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              {t('tryAgain')}
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
