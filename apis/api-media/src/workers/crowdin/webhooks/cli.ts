#!/usr/bin/env node

import { setupWebhooks, cleanupWebhooks, listWebhooks } from './webhookSetup'

async function main() {
  const command = process.argv[2]
  const baseUrl = process.argv[3]

  if (!command) {
    console.log('Usage:')
    console.log(
      '  setup <baseUrl>     - Set up webhooks for the given base URL'
    )
    console.log(
      '  cleanup <baseUrl>   - Remove webhooks for the given base URL'
    )
    console.log('  list               - List all current webhooks')
    process.exit(1)
  }

  try {
    switch (command) {
      case 'setup':
        if (!baseUrl) {
          console.error('Error: baseUrl is required for setup command')
          process.exit(1)
        }
        console.log(`Setting up webhooks for ${baseUrl}...`)
        await setupWebhooks(baseUrl)
        console.log('Webhooks set up successfully!')
        break

      case 'cleanup':
        if (!baseUrl) {
          console.error('Error: baseUrl is required for cleanup command')
          process.exit(1)
        }
        console.log(`Cleaning up webhooks for ${baseUrl}...`)
        await cleanupWebhooks(baseUrl)
        console.log('Webhooks cleaned up successfully!')
        break

      case 'list':
        console.log('Listing current webhooks...')
        await listWebhooks()
        break

      default:
        console.error(`Unknown command: ${command}`)
        process.exit(1)
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
