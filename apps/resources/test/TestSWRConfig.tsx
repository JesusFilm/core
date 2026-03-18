import type { FC, PropsWithChildren } from 'react'
import { SWRConfig } from 'swr'

export const TestSWRConfig: FC<PropsWithChildren> = ({ children }) => (
  <SWRConfig
    value={{
      provider: () => new Map(), // isolate cache
      dedupingInterval: 0, // simplify timing
      revalidateOnFocus: false, // avoid focus-triggered refetch
      revalidateOnReconnect: false,
      refreshInterval: 0
    }}
  >
    {children}
  </SWRConfig>
)
