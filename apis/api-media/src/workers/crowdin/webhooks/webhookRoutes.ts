import { Router } from 'express'
import { Logger } from 'pino'

import { CrowdinWebhookHandler } from './crowdinWebhookHandler'

export function createWebhookRoutes(logger?: Logger): Router {
  const router = Router()
  const webhookHandler = new CrowdinWebhookHandler(logger)

  // Main webhook endpoint for all translation updates
  router.post('/translations', async (req, res) => {
    try {
      await webhookHandler.handleWebhook(req.body)
      res.status(200).json({ success: true })
    } catch (error) {
      logger?.error('Webhook processing failed', { error, body: req.body })
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Webhook test endpoint (for development)
  router.post('/test', async (req, res) => {
    try {
      logger?.info('Test webhook received', { body: req.body })
      await webhookHandler.handleWebhook(req.body)
      res
        .status(200)
        .json({ success: true, message: 'Test webhook processed successfully' })
    } catch (error) {
      logger?.error('Test webhook failed', { error, body: req.body })
      res
        .status(500)
        .json({ error: 'Test webhook failed', details: error.message })
    }
  })

  return router
}

// Express app integration helper
export function setupWebhookRoutes(app: any, logger?: Logger): void {
  const webhookRoutes = createWebhookRoutes(logger)
  app.use('/api/crowdin/webhooks', webhookRoutes)

  logger?.info('Webhook routes configured at /api/crowdin/webhooks')
}
