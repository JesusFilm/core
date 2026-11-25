import { z } from 'zod'

import { imageByteLimit } from '@core/yoga/mcp/mediaJobContract'
import { boundedJson } from '@core/yoga/mcp/readContract'

import { imageHash, validateImageInput } from './mcpImageInput'
import { cloudflareUploadProvider } from './mcpImageProvider'

export const generatedImageMetadata = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurhash: z.string().min(1)
})
export interface ImageGenerationProvider {
  dispatch(
    id: string,
    prompt: string
  ): Promise<'rejected' | 'processing' | 'ready'>
  status(
    id: string
  ): Promise<
    | 'unknown'
    | 'processing'
    | { state: 'ready'; metadata: z.infer<typeof generatedImageMetadata> }
  >
}

/** Workers AI has no retrieval API for a lost synchronous response. Only the
 * persisted Images identity can recover success; absence never authorizes POST.
 * No SDK retries, prompt logging, provider errors or arbitrary URLs are used.
 */
export function cloudflareGenerationProvider(
  env: NodeJS.ProcessEnv
): ImageGenerationProvider {
  const account = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .parse(env.CLOUDFLARE_ACCOUNT_ID)
  const token = z.string().min(1).parse(env.CLOUDFLARE_IMAGES_TOKEN)
  const aiToken = z.string().min(1).parse(env.CLOUDFLARE_WORKERS_AI_TOKEN)
  const base = `https://api.cloudflare.com/client/v4/accounts/${account}`
  const images = cloudflareUploadProvider(env)
  async function metadata(bytes: Buffer) {
    return validateImageInput(bytes, {
      name: 'generated.jpg',
      mime: 'image/jpeg',
      size: bytes.length,
      sha256: imageHash(bytes)
    })
  }
  return {
    async dispatch(id, prompt) {
      try {
        const response = await fetch(
          `${base}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${aiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt }),
            redirect: 'error',
            signal: AbortSignal.timeout(20000)
          }
        )
        if (!response.ok) {
          if ([401, 403, 413, 415].includes(response.status)) {
            const rejection = z
              .object({
                success: z.literal(false),
                result: z.null().optional(),
                errors: z.array(z.object({ code: z.number().int() })).min(1)
              })
              .safeParse(
                await boundedJson(new Response(response.body)).catch(
                  () => undefined
                )
              )
            if (rejection.success) return 'rejected'
          }
          throw new Error('Unresolved generation')
        }
        const value = z
          .object({
            success: z.literal(true),
            result: z.object({
              image: z
                .string()
                .min(1)
                .max(Math.ceil(imageByteLimit / 3) * 4)
            })
          })
          .parse(
            await boundedJson(
              response,
              Math.ceil(imageByteLimit / 3) * 4 + 16384
            )
          )
        const bytes = Buffer.from(value.result.image, 'base64')
        await metadata(bytes)
        return await images.dispatch(id, bytes, 'image/jpeg')
      } catch {
        throw new Error('Generation handoff unresolved')
      }
    },
    async status(id) {
      try {
        const state = await images.status(id)
        if (state !== 'ready') return state
        const response = await fetch(
          `${base}/images/v1/${encodeURIComponent(id)}/blob`,
          {
            headers: { Authorization: `Bearer ${token}` },
            redirect: 'error',
            signal: AbortSignal.timeout(10000)
          }
        )
        if (!response.ok || !response.body) return 'unknown'
        const reader = response.body.getReader()
        const parts: Uint8Array[] = []
        let size = 0
        try {
          while (true) {
            const next = await reader.read()
            if (next.done) break
            size += next.value.length
            if (size > imageByteLimit) return 'unknown'
            parts.push(next.value)
          }
        } finally {
          await reader.cancel().catch(() => undefined)
        }
        return {
          state: 'ready',
          metadata: await metadata(Buffer.concat(parts))
        }
      } catch {
        return 'unknown'
      }
    }
  }
}
