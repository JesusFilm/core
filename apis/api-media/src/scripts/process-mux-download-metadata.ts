import { processDownloads } from './mux-videos'

async function main(): Promise<void> {
  try {
    console.log('Starting Mux download metadata processing script...')
    await processDownloads()
    console.log('Mux download metadata processing completed successfully!')
  } catch (error) {
    console.error('Mux download metadata processing failed:', error)
    process.exit(1)
  }
}

void main()
