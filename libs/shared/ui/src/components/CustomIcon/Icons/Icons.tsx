import { lazy } from 'react'

export const IconNames = ['none', 'Edit', 'Like', 'Target'] as const

export const iconComponents = {
  none: null,
  Edit: lazy(
    async () =>
      await import(
        /* webpackChunkName: 'custom-icon' */
        '../outlined/Edit'
      )
  ),
  Like: lazy(
    async () =>
      await import(
        /* webpackChunkName: 'custom-icon' */
        '../outlined/Like'
      )
  ),
  Target: lazy(
    async () =>
      await import(
        /* webpackChunkName: 'custom-icon' */
        '../outlined/Target'
      )
  )
}
