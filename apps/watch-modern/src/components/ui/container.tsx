import React from 'react'
import type { HTMLAttributes, ReactElement } from 'react'

import { cn } from '@/lib/utils'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function Container({ className, ...props }: ContainerProps): ReactElement {
  return <div className={cn('mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8', className)} {...props} />
}
