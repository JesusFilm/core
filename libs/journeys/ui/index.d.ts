export type DateTime = string
declare module '*.svg'

declare global {
  type DateTime = string
  
  var process: {
    env: {
      NEXT_PUBLIC_JOURNEYS_ADMIN_URL?: string
      NEXT_PUBLIC_JOURNEYS_URL?: string
      NEXT_PUBLIC_ALGOLIA_APP_ID?: string
      NEXT_PUBLIC_ALGOLIA_API_KEY?: string
      ALGOLIA_SERVER_API_KEY?: string
      NEXT_PUBLIC_MUX_USER_GENERATED_REPORTING_KEY?: string
      NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY?: string
      NEXT_PUBLIC_VERCEL_URL?: string
    }
  }
}
