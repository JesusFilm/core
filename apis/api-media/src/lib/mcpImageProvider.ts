import { z } from 'zod'

import { boundedJson } from '@core/yoga/mcp/readContract'

export interface ImageUploadProvider {
  dispatch(
    id: string,
    bytes: Buffer,
    mime: string
  ): Promise<'processing' | 'ready'>
  status(id: string): Promise<'unknown' | 'processing' | 'ready'>
}

/** Server-to-server upload with the already persisted provider identity. A lost
 * creation response is reconciled with authenticated GET, never another POST.
 */
export function cloudflareUploadProvider(
  env: NodeJS.ProcessEnv
): ImageUploadProvider {
  const account = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .parse(env.CLOUDFLARE_ACCOUNT_ID)
  const token = z.string().min(1).parse(env.CLOUDFLARE_IMAGES_TOKEN)
  const base = `https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`
  const parse = (value: unknown, id: string) => {
    const response = z
      .object({
        success: z.literal(true),
        result: z.object({
          id: z.literal(id),
          draft: z.boolean().optional(),
          uploaded: z.string().optional()
        })
      })
      .parse(value)
    return response.result.draft === true || !response.result.uploaded
      ? ('processing' as const)
      : ('ready' as const)
  }
  return {
    async dispatch(id, bytes, mime) {
      const body = new FormData()
      body.set('id', id)
      body.set(
        'file',
        new Blob([new Uint8Array(bytes)], { type: mime }),
        'image'
      )
      body.set('requireSignedURLs', 'false')
      const response = await fetch(base, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
        redirect: 'error',
        signal: AbortSignal.timeout(30000)
      })
      if (!response.ok) throw new Error('Provider handoff unresolved')
      return parse(await boundedJson(response), id)
    },
    async status(id) {
      const response = await fetch(`${base}/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'error',
        signal: AbortSignal.timeout(10000)
      })
      if (response.status === 404) return 'unknown'
      if (!response.ok) throw new Error('Provider status unavailable')
      return parse(await boundedJson(response), id)
    }
  }
}
