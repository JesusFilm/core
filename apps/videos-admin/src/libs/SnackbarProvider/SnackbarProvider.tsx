'use client'

import {
  SnackbarProvider as NotiStackProvider,
  SnackbarProviderProps
} from 'notistack'
import { ReactElement } from 'react'

export function SnackbarProvider({
  children,
  ...props
}: SnackbarProviderProps): ReactElement {
  return <NotiStackProvider {...props}>{children}</NotiStackProvider>
}
