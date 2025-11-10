'use client'

import { useSearchParams } from 'next/navigation'

export function useRedirectParam(): string | null {
  const searchParams = useSearchParams()

  return searchParams?.get('redirect') ?? null
}
