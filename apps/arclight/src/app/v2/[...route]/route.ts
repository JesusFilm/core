import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const dynamic = 'force-dynamic'

const app = new Hono().basePath('/v2')

app.get('/media-component-links', (c) => {
  return c.json({
    message: 'Hello from Hono on Vercel!'
  })
})

app.get('/:wild', (c) => {
  const wild = c.req.param('wild')
  return c.json({
    message: `Hello from Hono on Vercel! You're now on /api/${wild}!`
  })
})

export const GET = handle(app)
