import { NextResponse } from 'next/server'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL

export async function GET() {
  if (!GATEWAY_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_GATEWAY_URL is not set.' },
      { status: 500 }
    )
  }

  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-graphql-client-name': 'ai-media'
    },
    body: JSON.stringify({
      query: `
        query GetLanguages {
          languages(limit: 5000) {
            id
            slug
            nativeName: name(primary: true) {
              value
            }
            name(primary: false) {
              value
              language {
                id
              }
            }
          }
        }
      `
    }),
    cache: 'no-store'
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to load languages.' },
      { status: response.status }
    )
  }

  const payload = (await response.json()) as {
    data?: {
      languages?: Array<{
        id: string
        slug?: string
        nativeName?: Array<{ value: string }>
        name?: Array<{ value: string; language?: { id: string } }>
      }>
    }
  }

  const languages =
    payload.data?.languages
      ?.map((language) => {
        const nativeName = language.nativeName?.[0]?.value
        const localizedNames =
          language.name
            ?.filter((name) => name.value !== '' && name.language?.id)
            .map((name) => `${name.language?.id}:${name.value}`) ?? []

        if (localizedNames.length === 0 && nativeName == null) return null

        const languageIdAndSlug = `${language.id}:${language.slug ?? ''}${
          nativeName ? `:${nativeName}` : ''
        }`

        return [languageIdAndSlug, ...localizedNames]
      })
      .filter((language): language is string[] => language != null) ?? []

  return NextResponse.json(languages)
}
