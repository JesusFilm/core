import { GraphQLError } from 'graphql'

interface CloudflareApiErrorShape {
  status?: number
  errors?: Array<{ code?: number; message?: string }>
  message?: string
}

function asCloudflareApiError(error: unknown): CloudflareApiErrorShape | null {
  if (typeof error !== 'object' || error == null) return null
  const candidate = error as CloudflareApiErrorShape
  return typeof candidate.status === 'number' ? candidate : null
}

/** A Cloudflare API 404: the namespace, script or route does not exist. */
export function isCloudflareNotFound(error: unknown): boolean {
  return asCloudflareApiError(error)?.status === 404
}

/** The messages Cloudflare returned, for showing to the superAdmin as is. */
export function cloudflareErrorMessage(error: unknown): string {
  const apiError = asCloudflareApiError(error)
  const messages = (apiError?.errors ?? []).flatMap(({ code, message }) =>
    message == null ? [] : [code == null ? message : `${message} (${code})`]
  )
  if (messages.length > 0) return messages.join('; ')
  return error instanceof Error ? error.message : 'unknown error'
}

/**
 * Runs an infrastructure operation and turns a Cloudflare API failure into a
 * GraphQL error carrying Cloudflare's own message, which is what the
 * superAdmin needs to act on (existing DNS records, missing token scope, ...).
 * Anything else (GraphQL errors, typed errors) passes through untouched.
 */
export async function withCloudflareErrors<Result>(
  operation: () => Promise<Result>
): Promise<Result> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof GraphQLError || asCloudflareApiError(error) == null)
      throw error
    throw new GraphQLError(`Cloudflare: ${cloudflareErrorMessage(error)}`, {
      extensions: { code: 'CLOUDFLARE_ERROR' }
    })
  }
}
