import './loadEnv'

import { z } from 'zod'

const requiredEnvSchema = z.object({
  GRAPHQL_ENDPOINT: z.url().trim().min(1),
  FIREBASE_EMAIL: z.string().trim().min(1),
  FIREBASE_PASSWORD: z.string().trim().min(1),
  FIREBASE_API_KEY: z.string().trim().min(1),
  FIREBASE_AUTH_DOMAIN: z.string().trim().min(1),
  FIREBASE_PROJECT_ID: z.string().trim().min(1),
  FIREBASE_APP_ID: z.string().trim().min(1),

  CLOUDFLARE_R2_ENDPOINT: z.url().trim().min(1),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().trim().min(1),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().trim().min(1),
  CLOUDFLARE_R2_BUCKET: z.string().trim().min(1),
  CLOUDFLARE_R2_CUSTOM_DOMAIN: z.url().trim().min(1),

  SLACK_BOT_TOKEN: z.string().trim().min(1),
  SLACK_CHANNEL_ID: z.string().trim().min(1)
})

export interface StartupPreflightFailure {
  variable: string
  message: string
}

function formatStartupIssue(issue: z.core.$ZodIssue): string {
  if (issue.code === 'too_small' || issue.code === 'invalid_type') {
    return 'is missing'
  }

  if (issue.code === 'invalid_format' && issue.format === 'url') {
    return 'must be a valid URL'
  }

  return issue.message
}

export function checkStartupEnvironment(
  runtimeEnv: NodeJS.ProcessEnv = process.env
): StartupPreflightFailure[] {
  const result = requiredEnvSchema.safeParse(runtimeEnv)

  if (result.success) {
    return []
  }

  return result.error.issues.map((issue) => ({
    variable: issue.path.join('.') || '(environment)',
    message: formatStartupIssue(issue)
  }))
}
