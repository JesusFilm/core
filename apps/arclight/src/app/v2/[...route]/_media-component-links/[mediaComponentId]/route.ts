import { createRoute, z } from '@hono/zod-openapi'

import { mediaComponentSchema } from '../../mediaComponent.schema'

const ParamsSchema = z.object({
  mediaComponentId: z.string()
})

const QuerySchema = z.object({
  expand: z.string().optional(),
  rel: z.string().optional(),
  languageIds: z.string().optional()
})

const ResponseSchema = z.object({
  mediaComponentId: z.string(),
  linkedMediaComponentIds: z.object({
    contains: z.array(z.string()).optional(),
    containedBy: z.array(z.string()).optional()
  }),
  _links: z.object({
    self: z.object({
      href: z.string()
    }),
    mediaComponent: z.array(
      z.object({
        href: z.string(),
        templated: z.boolean().optional()
      })
    )
  }),
  _embedded: z.object({
    mediaComponents: z.array(mediaComponentSchema)
  })
})

export const route = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: QuerySchema,
    params: ParamsSchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'media component link'
    },
    404: {
      description: 'Not Found'
    }
  }
})
