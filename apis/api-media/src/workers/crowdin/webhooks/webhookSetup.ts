import { Logger } from 'pino'

import {
  crowdinClient,
  crowdinProjectId
} from '../../lib/crowdin/crowdinClient'

export interface WebhookConfig {
  name: string
  url: string
  events: string[]
  headers?: Record<string, string>
}

export class CrowdinWebhookSetup {
  private logger?: Logger

  constructor(logger?: Logger) {
    this.logger = logger?.child({ component: 'crowdinWebhookSetup' })
  }

  async listWebhooks(): Promise<any[]> {
    try {
      const response =
        await crowdinClient.webhooksApi.listWebhooks(crowdinProjectId)
      this.logger?.info('Retrieved webhooks', { count: response.data.length })
      return response.data
    } catch (error) {
      this.logger?.error('Failed to list webhooks', { error })
      throw error
    }
  }

  async createWebhook(config: WebhookConfig): Promise<any> {
    try {
      const response = await crowdinClient.webhooksApi.addWebhook(
        crowdinProjectId,
        {
          name: config.name,
          url: config.url,
          events: config.events,
          headers: config.headers || {}
        }
      )

      this.logger?.info('Created webhook', {
        name: config.name,
        url: config.url,
        webhookId: response.data.id
      })

      return response.data
    } catch (error) {
      this.logger?.error('Failed to create webhook', { error, config })
      throw error
    }
  }

  async updateWebhook(
    webhookId: number,
    config: Partial<WebhookConfig>
  ): Promise<any> {
    try {
      const response = await crowdinClient.webhooksApi.editWebhook(
        crowdinProjectId,
        webhookId,
        {
          name: config.name,
          url: config.url,
          events: config.events,
          headers: config.headers
        }
      )

      this.logger?.info('Updated webhook', { webhookId, config })
      return response.data
    } catch (error) {
      this.logger?.error('Failed to update webhook', {
        error,
        webhookId,
        config
      })
      throw error
    }
  }

  async deleteWebhook(webhookId: number): Promise<void> {
    try {
      await crowdinClient.webhooksApi.deleteWebhook(crowdinProjectId, webhookId)
      this.logger?.info('Deleted webhook', { webhookId })
    } catch (error) {
      this.logger?.error('Failed to delete webhook', { error, webhookId })
      throw error
    }
  }

  async setupTranslationWebhooks(baseUrl: string): Promise<void> {
    const webhookConfigs: WebhookConfig[] = [
      {
        name: 'Video Titles Translation Updates',
        url: `${baseUrl}/api/crowdin/webhooks/translations`,
        events: ['string.updated', 'string.added']
      },
      {
        name: 'Video Descriptions Translation Updates',
        url: `${baseUrl}/api/crowdin/webhooks/translations`,
        events: ['string.updated', 'string.added']
      },
      {
        name: 'Study Questions Translation Updates',
        url: `${baseUrl}/api/crowdin/webhooks/translations`,
        events: ['string.updated', 'string.added']
      }
    ]

    // Check existing webhooks
    const existingWebhooks = await this.listWebhooks()
    const existingUrls = existingWebhooks.map((w) => w.data.url)

    for (const config of webhookConfigs) {
      if (existingUrls.includes(config.url)) {
        this.logger?.info('Webhook already exists', { url: config.url })
        continue
      }

      await this.createWebhook(config)
    }

    this.logger?.info('Webhook setup completed')
  }

  async cleanupOldWebhooks(baseUrl: string): Promise<void> {
    const existingWebhooks = await this.listWebhooks()

    for (const webhook of existingWebhooks) {
      if (webhook.data.url.startsWith(baseUrl)) {
        await this.deleteWebhook(webhook.data.id)
      }
    }

    this.logger?.info('Cleaned up old webhooks')
  }
}

// CLI utility functions
export async function setupWebhooks(
  baseUrl: string,
  logger?: Logger
): Promise<void> {
  const setup = new CrowdinWebhookSetup(logger)
  await setup.setupTranslationWebhooks(baseUrl)
}

export async function cleanupWebhooks(
  baseUrl: string,
  logger?: Logger
): Promise<void> {
  const setup = new CrowdinWebhookSetup(logger)
  await setup.cleanupOldWebhooks(baseUrl)
}

export async function listWebhooks(logger?: Logger): Promise<void> {
  const setup = new CrowdinWebhookSetup(logger)
  const webhooks = await setup.listWebhooks()

  console.log('Current webhooks:')
  webhooks.forEach((webhook) => {
    console.log(`- ${webhook.data.name}: ${webhook.data.url}`)
  })
}
