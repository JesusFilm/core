import { Hono } from 'hono'

import { languages } from '../languages'

export const metadataLanguageTag = new Hono()
metadataLanguageTag.get('/', async (c) => {
  const metadataLanguageTag = c.req.param('metadataLanguageTag')
  const apiKey = c.req.query('apiKey') ?? ''

  if (!metadataLanguageTag) {
    return new Response(
      JSON.stringify({
        message: 'Metadata language tag is required'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  const language = languages.find((lang) => lang.tag === metadataLanguageTag)

  if (!language) {
    return c.json(
      {
        message: `Metadata language tag '${metadataLanguageTag}' not found!`,
        logref: 404
      },
      404
    )
  }

  const response = [
    {
      tag: language.tag,
      name: language.name,
      nameNative: language.nameNative,
      _links: {
        self: {
          href: `http://api.arclight.org/v2/metadata-language-tags/${language.tag}?apiKey=${apiKey}`
        },
        metadataLanguageTags: {
          href: `http://api.arclight.org/v2/metadata-language-tags?apiKey=${apiKey}`
        }
      }
    }
  ]

  return c.json(response)
})
