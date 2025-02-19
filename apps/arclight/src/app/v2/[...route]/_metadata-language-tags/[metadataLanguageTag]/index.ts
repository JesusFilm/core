import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

import { languages } from '../languages'

const QuerySchema = z.object({
  apiKey: z.string().optional()
})

const ParamsSchema = z.object({
  metadataLanguageTag: z.string()
})

const ResponseSchema = z.object({
  tag: z.string(),
  name: z.string(),
  nameNative: z.string(),
  _links: z.object({
    self: z.object({
      href: z.string().url()
    }),
    metadataLanguageTags: z.object({
      href: z.string().url()
    })
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: QuerySchema,
    params: ParamsSchema
  },
  responses: {
    200: {
      content: { 'application/json': { schema: ResponseSchema } },
      description: 'Metadata language tag'
    },
    400: {
      content: {
        'application/json': { schema: z.object({ message: z.string() }) }
      },
      description: 'Metadata language tag is required'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            logref: z.number()
          })
        }
      },
      description: 'Metadata language tag not found'
    }
  }
})

export const metadataLanguageTag = new OpenAPIHono()
metadataLanguageTag.openapi(route, async (c) => {
  const metadataLanguageTag = c.req.param('metadataLanguageTag')
  const apiKey = c.req.query('apiKey') ?? ''

  if (!metadataLanguageTag) {
    return c.json(
      {
        message: 'Metadata language tag is required'
      },
      400
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
