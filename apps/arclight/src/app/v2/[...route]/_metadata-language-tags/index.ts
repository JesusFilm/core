import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

import { metadataLanguageTag } from './[metadataLanguageTag]'
import { languages } from './languages'

export const metadataLanguageTags = new OpenAPIHono()
metadataLanguageTags.route('/:metadataLanguageTag', metadataLanguageTag)

const QuerySchema = z.object({
  apiKey: z.string().optional().describe('API key')
})

const ResponseSchema = z.object({
  _links: z.object({
    self: z.object({
      href: z.string()
    })
  }),
  _embedded: z.object({
    metadataLanguageTags: z.array(
      z.object({
        tag: z.string(),
        name: z.string(),
        nameNative: z.string()
      })
    )
  })
})

const route = createRoute({
  method: 'get',
  tags: ['Metadata Language Tags'],
  summary: 'Get metadata language tags',
  description: 'Get metadata language tags',
  path: '/',
  request: {
    query: QuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'Metadata language tags'
    },
    400: {
      description: 'Bad Request'
    },
    404: {
      description: 'Not Found'
    }
  }
})

metadataLanguageTags.openapi(route, async (c) => {
  const apiKey = c.req.query('apiKey') ?? ''

  const languagesList = languages
    .map((language) => ({
      tag: language.tag,
      name: language.name,
      nameNative: language.nameNative,
      _links: {
        self: {
          href: `http://api.arclight.org/v2/metadata-language-tags/${language.tag}?apiKey=${apiKey}`
        },
        metadataLanguageTags: {
          href: `http://api.arclight.org/v2/metadata-language-tags/?apiKey=${apiKey}`
        }
      }
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag))

  const response = {
    _links: {
      self: {
        href: `http://api.arclight.org/v2/metadata-language-tags/?apiKey=${apiKey}`
      }
    },
    _embedded: {
      metadataLanguageTags: languagesList
    }
  }

  return c.json(response)
})
