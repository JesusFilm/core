import { getTranslations } from 'next-intl/server'

/**
 * Example server component demonstrating server-side rendering with next-intl
 * This component can be used in any server component (pages, layouts, other server components)
 *
 * @returns {JSX.Element} The rendered server component
 */
export default async function ServerExample(): Promise<JSX.Element> {
  const t = await getTranslations('apps-watch-modern')

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">
        {t('Server Component Example')}
      </h3>
      <p className="text-gray-600 mb-4">
        {t(
          'This component is rendered on the server and uses getTranslations for internationalization.'
        )}
      </p>
      <div className="text-sm text-gray-500">
        <p>{t('Benefits of server components:')}</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>{t('Faster initial page loads')}</li>
          <li>{t('Better SEO')}</li>
          <li>{t('Reduced bundle size')}</li>
          <li>{t('Better caching')}</li>
        </ul>
      </div>
    </div>
  )
}
