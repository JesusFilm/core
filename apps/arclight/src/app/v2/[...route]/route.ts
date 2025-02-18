import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { handle } from 'hono/vercel'

import { mediaComponentLinks } from './_media-component-links'

export const dynamic = 'force-dynamic'

const app = new Hono().basePath('/v2')
app.use(etag())

app.route('/media-component-links', mediaComponentLinks)

export const GET = handle(app)
