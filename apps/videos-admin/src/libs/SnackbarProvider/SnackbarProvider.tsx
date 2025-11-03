'use client'

import {
  SnackbarProvider as NotiStackProvider,
  SnackbarProviderProps
} from 'notistack'
import React from 'react'

export const SnackbarProvider: React.FC<
  { children: React.ReactNode } & Partial<SnackbarProviderProps>
> = ({ children, ...props }) => {
  return <NotiStackProvider {...props}>{children}</NotiStackProvider>
}
