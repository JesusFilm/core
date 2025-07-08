'use client'

import { ReactElement } from 'react'

const PAGE_TITLE = 'New Page'

/**
 * New page component
 * @returns {ReactElement} The rendered new page
 */
export default function NewPage(): ReactElement {
  return (
    <main className="flex-1 py-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">{PAGE_TITLE}</h2>
      </div>
    </main>
  )
}
