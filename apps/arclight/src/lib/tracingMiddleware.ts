import tracer from 'dd-trace'
import { Context, Next } from 'hono'

import { logger } from '../logger'

export function createTracingMiddleware(spanName: string, serviceName: string) {
  return async (c: Context, next: Next) => {
    const span = tracer.startSpan(spanName, {
      tags: {
        'http.method': c.req.method,
        'http.url': c.req.url,
        'service.name': serviceName
      }
    })

    // Log request details
    logger.info(
      {
        method: c.req.method,
        url: c.req.url,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip')
      },
      `${serviceName} request received`
    )

    try {
      await next()
      span.setTag('http.status_code', c.res.status)

      // Log successful response
      logger.info(
        {
          method: c.req.method,
          url: c.req.url,
          statusCode: c.res.status
        },
        `${serviceName} request completed`
      )

      span.finish()
    } catch (error) {
      span.setTag('error', true)
      span.setTag(
        'error.message',
        error instanceof Error ? error.message : String(error)
      )

      // Log error with stack trace
      logger.error(
        {
          method: c.req.method,
          url: c.req.url,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        },
        `${serviceName} request failed`
      )

      span.finish()
      throw error
    }
  }
}
