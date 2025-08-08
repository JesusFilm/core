import type { ReactElement } from 'react'

export default function TestPage(): ReactElement {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Test Page Working!
          </h1>
          <p className="text-lg text-gray-300">
            Routing is working correctly.
          </p>
        </div>
      </div>
    </div>
  )
}
