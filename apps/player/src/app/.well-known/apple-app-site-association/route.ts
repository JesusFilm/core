import { NextResponse } from 'next/server'

import { env } from '@/env'

export const revalidate = 60 * 60 * 24 * 30 // 30 days

export function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: `${env.NEXT_PUBLIC_IOS_APP_TEAM_ID}.${env.NEXT_PUBLIC_IOS_APP_BUNDLE_ID}`,
            paths: ['*', '/']
          }
        ]
      }
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}
