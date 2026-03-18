import { NextResponse } from 'next/server'

import { env } from '@/env'

export const revalidate = 2592000 // 30 days

export function GET() {
  return NextResponse.json(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: env.NEXT_PUBLIC_ANDROID_APP_ID,
          sha256_cert_fingerprints: [
            env.NEXT_PUBLIC_ANDROID_APP_SHA256_CERT_FINGERPRINT
          ]
        }
      }
    ],
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}
