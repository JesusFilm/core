import { NextRequest, NextResponse } from 'next/server'

import { middleware } from './middleware'

describe('middleware', () => {
  const url = 'http://localhost:4300/'

  it('should set the NEXT_COUNTRY cookie if country is available', async () => {
    const request = new Request(url)
    const req = new NextRequest(request, {
      geo: { country: 'US' }
    })
    const response = await middleware(req)

    expect(response?.cookies.get('NEXT_COUNTRY')?.value).toBe('00001---US')
  })

  it('should not set the NEXT_COUNTRY cookie if country is unknown', () => {
    const request = new NextRequest(url, {
      geo: { country: undefined }
    })
    const response = middleware(request) as NextResponse

    expect(response.cookies.get('NEXT_COUNTRY')).toBeUndefined()
  })
})
