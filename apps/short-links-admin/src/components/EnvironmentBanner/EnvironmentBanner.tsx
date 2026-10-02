'use client'

import { ReactElement } from 'react'

import { shouldShowEnvironmentBanner } from '../../libs/environment'

export function EnvironmentBanner(): ReactElement | null {
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL

  if (!shouldShowEnvironmentBanner()) return null

  const environmentName = gatewayUrl?.includes('stage.central.jesusfilm.org')
    ? 'STAGE'
    : 'NON-PRODUCTION'

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[9999] flex h-9 items-center justify-center border-b-2 border-red-700 bg-red-500 px-4 text-sm font-bold text-white shadow"
    >
      {environmentName} ENVIRONMENT
    </div>
  )
}
