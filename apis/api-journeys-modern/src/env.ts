import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

import { parseEmbedHostsEnv } from './parseEmbedHostsEnv'

export const env = createEnv({
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
  onValidationError: (issues) => {
    console.error('❌ Invalid environment variables:', issues)
    throw new Error('Invalid environment variables')
  },
  server: {
    CLOUDFLARE_UPLOAD_KEY: z.string().trim().min(1),
    FACEBOOK_APP_ID: z.string().trim().min(1),
    FACEBOOK_APP_SECRET: z.string().trim().min(1),
    FIREBASE_API_KEY: z.string().trim().min(1),
    GATEWAY_HMAC_SECRET: z.string().trim().min(1),
    GATEWAY_URL: z.string().trim().min(1),
    GOOGLE_CLIENT_ID: z.string().trim().min(1),
    GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
    GROWTH_SPACES_URL: z.string().trim().min(1),
    INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET: z.string().trim().min(1),
    INTEROP_TOKEN: z.string().trim().min(1),
    JOURNEYS_ADMIN_URL: z.string().trim().min(1),
    JOURNEYS_REVALIDATE_ACCESS_TOKEN: z.string().trim().min(1),
    JOURNEYS_URL: z.string().trim().min(1),
    PLAUSIBLE_API_KEY: z.string().trim().min(1),
    PLAUSIBLE_URL: z.url().refine((url) => !url.endsWith('/'), {
      message: 'PLAUSIBLE_URL must not end with a trailing slash'
    }),
    CLOUDFLARE_ACCOUNT_ID: z.string().trim().min(1),
    CLOUDFLARE_IMAGES_TOKEN: z.string().trim().min(1),
    MUX_UGC_ACCESS_TOKEN_ID: z.string().trim().min(1),
    MUX_UGC_SECRET_KEY: z.string().trim().min(1),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_URL: z.string().trim().min(1).default('redis'),
    SERVICE_VERSION: z.string().trim().default(''),
    // JSON object mapping a label (service name) to a single allowed hostname,
    // one entry per host — the single source of truth for the template-library
    // embed allowlist. Must include the provider hosts the normalizers expect
    // (canva.com, youtube.com, docs.google.com, etc.); there is no code-default
    // seeding. Parsed and validated by parseEmbedHostsEnv — a non-object,
    // malformed JSON, or an invalid hostname value fails boot loudly.
    TEMPLATE_LIBRARY_EMBED_HOSTS: z
      .string()
      .default('{}')
      .transform(parseEmbedHostsEnv)
  }
})
