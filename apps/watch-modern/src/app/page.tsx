'use client'

const TITLE = 'Welcome to Watch Modern'
const SUBTITLE = 'Your modern streaming platform'

/**
 * Home page component for the watch-modern application
 * @returns {JSX.Element} The rendered home page
 */
export default function Index(): JSX.Element {
  return (
    <main className="flex-1 py-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{TITLE}</h2>
        </div>
        <div>
          <p className="text-gray-600">{SUBTITLE}</p>
        </div>
      </div>
    </main>
  )
}
