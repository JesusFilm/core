import { GraphQLError } from 'graphql'

import { ShortLinkAssetClass } from '@core/prisma/media/client'

import { contextIsSuperAdmin } from '../../../lib/superAdmin'
import { Context, isShortLinkAdmin } from '../../builder'

const PROTECTED_ASSET_CLASSES: ShortLinkAssetClass[] = [
  'permanent',
  'videoEmbedded'
]

export function isProtectedAssetClass(
  assetClass: ShortLinkAssetClass
): boolean {
  return PROTECTED_ASSET_CLASSES.includes(assetClass)
}

/**
 * "admin" in the protection rules: shortLinkAdmin or publisher. Interop
 * callers are editors only — they mint and edit standard links.
 */
export function contextIsShortLinkAdmin(context: Context): boolean {
  return (
    context.type === 'authenticated' && isShortLinkAdmin(context.currentRoles)
  )
}

/**
 * Who to record on a destination history row: the user id, or the calling
 * client name for interop callers (falling back to 'interop').
 */
export function contextActor(context: Context): string | undefined {
  switch (context.type) {
    case 'authenticated':
      return context.user.id
    case 'interop':
      return context.clientName ?? 'interop'
    default:
      return undefined
  }
}

export function forbidden(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
}

export function assertShortLinkAdmin(context: Context, message: string): void {
  if (contextIsShortLinkAdmin(context)) return
  throw forbidden(message)
}

/**
 * superAdmin (the flag on the user in the users database) owns which domains
 * exist and how a domain is wired to the edge: its path prefix, KV namespace
 * and Worker binding.
 */
export async function assertSuperAdmin(
  context: Context,
  message: string
): Promise<void> {
  if (await contextIsSuperAdmin(context)) return
  throw forbidden(message)
}
