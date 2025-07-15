import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

import { setCorsHeaders } from '../../../lib/redirectUtils'

const sRoute = createRoute({
  method: 'get',
  path: '/:mediaComponentId/:languageId',
  tags: ['Redirects by-convention'],
  summary: 'Redirects to the shareable watch page',
  description:
    'Redirects to the shareable watch page for the given media component and language IDs.',
  request: {
    params: z.object({
      mediaComponentId: z.string().describe('The ID of the media component'),
      languageId: z.string().describe('The ID of the language')
    })
  },
  responses: {
    302: {
      description: 'Redirects to the shareable watch page'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: 'Shareable watch page not found'
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: 'Internal server error'
    }
  }
} as const)

export const s = new OpenAPIHono()

s.openapi(sRoute, async (c) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  return c.redirect(
    `http://jesusfilm.org/bin/jf/watch.html/${mediaComponentId}/${languageId}`,
    302
  )
})

s.options('*', (c) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})
